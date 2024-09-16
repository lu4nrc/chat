import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Send from "@mui/icons-material/Send";

import AddAlert from "@mui/icons-material/AddAlert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import api from "../../services/api";

import toastError from "../../errors/toastError";

import {
  CircularProgress,
  Stack,
  TableContainer,
  Typography,
} from "@mui/material";
import ButtomCustom from "../../components/Shared/Buttons/ButtomCustom";
import TransmissionModal from "../../components/TransmissionModal";

const Transmission = () => {
  /* const classes = useStyles(); */
  const [loading, setLoading] = useState(false);
  const [transmissionId, setTransmissionId] = useState(null);
  const [sendLoading, setSendLoading] = useState(false);

  const [transmissions, setTransmissions] = useState([]);
  const [transmissionModalOpen, setTransmissionModalOpen] = useState(false);
  const [transmissionEdit, setTransmissionEdit] = useState(null);
  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/transmission/");
      setTransmissions(data);
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
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  const handleOpenTransmissionModal = () => {
    setTransmissionModalOpen(true);
  };

  const handleCloseTransmissionModal = () => {
    setTransmissionModalOpen(false);
    setTransmissionEdit(null);
    fetchContacts();
  };

  const handleEditTransmission = (transmission) => {
    setTransmissionEdit(transmission);
    setTransmissionModalOpen(true);
  };
  const deleteTransmission = async (id) => {
    try {
      await api.delete(`/transmission/${id}`);
      toast.success("Lista de transmissão deletada com sucesso", {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
      fetchContacts();
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
  };
  const sendTransmission = async (id) => {
    setSendLoading(true);
    setTransmissionId(id);
    try {
      var contactsErr = await api.post(`/transmission/send/${id}`);
      if (contactsErr?.length > 0) {
        toast.success(`Envio de mensagens com sucesso`, {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        });
        toast.info(
          contactsErr?.length > 1
            ? `Falha ao enviar para os seguintes contatos ${contactsErr}`
            : `Falha ao enviar para o seguinte contato ${contactsErr}`,
          {
            autoClose: false,
            closeOnClick: false,
          }
        );
      } else {
        toast.success("Mensagens enviadas com sucesso", {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        });
      }
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
    setSendLoading(false);
    setTransmissionId(null);
  };

  useEffect(() => {}, [transmissionEdit]);

  return (
    <Stack p={2} spacing={2}  overflow={"hidden"}>
      <TransmissionModal
        open={transmissionModalOpen}
        onClose={handleCloseTransmissionModal}
        aria-labelledby="form-dialog-title"
        transmission={transmissionEdit}
      ></TransmissionModal>

      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography variant="h5">Listas de transmissão</Typography>

        <ButtomCustom fn={handleOpenTransmissionModal}>
          Nova transmissão
        </ButtomCustom>
      </Stack>

      <TableContainer sx={{ maxHeight: `calc(100vh - 85px)` }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Nome da transmissão</TableCell>
              <TableCell align="center">Quantidade de contatos</TableCell>
              <TableCell align="center">Data de criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {transmissions.map((transmission) => (
                <TableRow key={transmission.id}>
                  <TableCell style={{ paddingRight: 0 }}>
                    {<AddAlert />}
                  </TableCell>
                  <TableCell>{transmission.name}</TableCell>
                  <TableCell align="center">
                    {transmission.contacts.length}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(transmission.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTransmission(transmission)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(_) => {
                        deleteTransmission(transmission.id);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => sendTransmission(transmission.id)}
                    >
                      {sendLoading && transmissionId === transmission.id ? (
                        <CircularProgress size={23} />
                      ) : (
                        <Send />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default Transmission;
