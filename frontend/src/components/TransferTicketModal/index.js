import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Autocomplete,
  Stack,
  Typography,
  createFilterOptions,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import CircularProgress from "@mui/material/CircularProgress";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { FiberManualRecord } from "@mui/icons-material";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { Can } from "../Can";

const filterOptions = createFilterOptions({
  trim: true,
});

const TransferTicketModal = ({
  modalOpen,
  onClose,
  ticketid,
  ticketWhatsappId,
}) => {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);

  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);

  const { findAll: findAllQueues } = useQueues();
  const { loadingWhatsapps, whatsApps } = useWhatsApps();

  const { user: loggedInUser } = useContext(AuthContext);

  useEffect(() => {
    const loadQueues = async () => {
      const list = await findAllQueues();
      setAllQueues(list);
      setQueues(list);
    };
    loadQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 1) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);

          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!ticketid) return;
    setLoading(true);
    try {
      let data = {};

      if (selectedUser) {
        data.userId = selectedUser.id;
      }

      if (selectedQueue && selectedQueue !== null) {
        data.queueId = selectedQueue;

        if (!selectedUser) {
          data.status = "pending";
          data.userId = null;
        }
      }

      if (selectedWhatsapp) {
        data.whatsappId = selectedWhatsapp;
      }

      await api.put(`/tickets/${ticketid}`, data);

      setLoading(false);
      navigate(`/tickets`);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title">Transferir Atendimento</DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            style={{ width: 300, marginBottom: 20 }}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <li {...props}>
                <FiberManualRecord
                  style={{
                    fontSize: 15,
                    color:
                      option.status === "active"
                        ? "#98E3C3"
                        : option.status === "lazy"
                        ? "#FBED90"
                        : "#f44336",
                    marginRight: 5,
                  }}
                />
                {option.name}
              </li>
            )}
            onChange={(e, newValue) => {
              setSelectedUser(newValue);
              if (newValue != null && Array.isArray(newValue.queues)) {
                setQueues(newValue.queues);
              } else {
                setQueues(allQueues);
                setSelectedQueue("");
              }
            }}
            options={options}
            filterOptions={filterOptions}
            freeSolo
            autoHighlight
            noOptionsText={i18n.t("transferTicketModal.noOptions")}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("transferTicketModal.fieldLabel")}
                variant="outlined"
                required
                autoFocus
                onChange={(e) => setSearchParam(e.target.value)}
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
          />

          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Departamento</Typography>
            <Select
              required
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
            >
              {/* <MenuItem value={""}>&nbsp;</MenuItem> */}
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Can
            role={loggedInUser.profile}
            perform="ticket-options:transferWhatsapp"
            yes={() =>
              !loadingWhatsapps && (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Conexão</Typography>
                  <Select
                    value={selectedWhatsapp}
                    onChange={(e) => setSelectedWhatsapp(e.target.value)}
                  >
                    {whatsApps.map((whasapp) => (
                      <MenuItem key={whasapp.id} value={whasapp.id}>
                        {whasapp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} variant="text">
            {i18n.t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
          >
            {i18n.t("transferTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferTicketModal;
