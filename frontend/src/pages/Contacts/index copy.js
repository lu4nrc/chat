import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import IconButton from "@mui/material/IconButton";

import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactModal from "../../components/ContactModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import api from "../../services/api";

import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

import {
  InputAdornment,
  Stack,
  TableContainer,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import {
  AddressBook,
  PencilSimple,
  Trash,
  UserCirclePlus,
  WhatsappLogo,
} from "@phosphor-icons/react";
import ButtomCustom from "../../components/Shared/Buttons/ButtomCustom";
import formatarNumeroTelefone from "../../utils/numberFormat";


const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {},
}));

const Contacts = () => {
  /*   const classes = useStyles(); */
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          const errorMsg =
          err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("contact", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user?.id,
        status: "open",
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
    setLoading(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"), {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      navigate.go(0);
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };
  return (
    <Stack p={2} spacing={2}>
      <Stack spacing={2}>
        <Typography variant="h5">Contatos</Typography>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          spacing={3}
        >
          <StyledInput
            size="small"
            placeholder="Pesquisar..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "grey" }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction={"row"} spacing={2}>
            <ButtomCustom
              startIcon={<AddressBook />}
              fn={(e) => setConfirmOpen(true)}
            >
              Importar contatos
            </ButtomCustom>
            <ButtomCustom
              startIcon={<UserCirclePlus />}
              fn={handleOpenContactModal}
            >
              Adicionar contato
            </ButtomCustom>
          </Stack>
        </Stack>
      </Stack>
      <Stack sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer
          onScroll={handleScroll}
          sx={{ maxHeight: `calc(100vh - 160px)` }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Nome</TableCell>
                <TableCell align="center">WhatsApp</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    {<Avatar src={contact.profilePicUrl} />}
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell align="center">{contact.number.length > 14
                                ? "Grupo"
                                : formatarNumeroTelefone(contact.number)}</TableCell>
                  <TableCell align="center">{contact.email}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleSaveTicket(contact.id)}
                    >
                      <WhatsappLogo size={24} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => hadleEditContact(contact.id)}
                    >
                      <PencilSimple size={24} />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmOpen(true);
                            setDeletingContact(contact);
                          }}
                        >
                          <Trash size={24} />
                        </IconButton>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : "Importar contatos"
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? "Tem certeza que deseja deletar este contato? Todos os chamados relacionados serão perdidos."
          : "Deseja importar todos os contatos do telefone?"}
      </ConfirmationModal>
    </Stack>
  );
};

export default Contacts;
