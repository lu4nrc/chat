import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  createFilterOptions,
} from "@mui/material";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import formatarNumeroTelefone from "../../utils/numberFormat";
import { ComboboxDemo } from "../ui/combobox-user";

const filter = createFilterOptions({
  trim: true,
});

const NewTicketModal = ({ modalOpen, onClose }) => {
  const navigate = useNavigate();

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({});
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
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
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedContact(null);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user.id,
        status: "open",
        isOutbound: true,
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
    handleClose();
  };

  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
      setContactModalOpen(true);
    }
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const handleAddNewContactTicket = (contact) => {
    handleSaveTicket(contact.id);
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);

    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }

    return filtered;
  };

  const renderOption = (props, option) => {
    if (option.number) {
      return (
        <Box
          component="li"
          sx={{
            display: "flex",
            flexDirection: "column",
            "& > img": {
              mr: 2,
              flexShrink: 0,
            },
          }}
          {...props}
        >
          <Typography variant="body1" width={"100%"}>
            {option.name}{" "}
          </Typography>
          <Typography variant="caption" width={"100%"} sx={{ color: "gray" }}>
            {option.number.length > 14
              ? "Grupo"
              : formatarNumeroTelefone(option.number)}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box
          component="li"
          sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
          {...props}
        >
          Adicionar novo: {option.name}
        </Box>
      );
    }
  };

  const renderOptionLabel = (option) => {
    if (option.number) {
      return `${option.name} - ${
        option.number.length > 14
          ? "Grupo"
          : formatarNumeroTelefone(option.number)
      }`;
    } else {
      return `${option.name}`;
    }
  };

  /* https://github.com/melanieseltzer/example-async-combobox-options/blob/main/components/search.tsx */

  return (
    <>
      <ContactModal
        open={contactModalOpen}
        initialValues={newContact}
        onClose={handleCloseContactModal}
        onSave={handleAddNewContactTicket}
      ></ContactModal>
      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">Novo atendimento</DialogTitle>
        <DialogContent dividers>
        <ComboboxDemo/>
     {/*      <Autocomplete
            options={options}
            loading={loading}
            style={{ width: 300 }}
            clearOnBlur
            autoHighlight
            freeSolo
            clearOnEscape
            getOptionLabel={renderOptionLabel}
            renderOption={renderOption}
            filterOptions={createAddContactOption}
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("newTicketModal.fieldLabel")}
                variant="outlined"
                autoFocus
                onChange={(e) => setSearchParam(e.target.value)}
                onKeyDown={(e) => {
                  if (loading || !selectedContact) return;
                  else if (e.key === "Enter") {
                    handleSaveTicket(selectedContact.id);
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} variant="text">
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={!selectedContact}
            onClick={() => handleSaveTicket(selectedContact.id)}
            color="primary"
            loading={loading}
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewTicketModal;
