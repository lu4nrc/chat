import React from "react";

import ClearIcon from "@mui/icons-material/Clear";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 312,
  borderRadius: 1,
  bgcolor: "background.paper",
  boxShadow: 24,
};

const ScheduleCancelModal = ({ handleClose, openStatus, value, callback }) => {

  const handleCloseModal = () => {
    handleClose();
  };

  const remove = async (notify) => {
    try {
      await api.delete(`scheduleds/${value}&${notify}`);
      callback();
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Modal
        open={openStatus}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <IconButton
            sx={{ position: "absolute", right: 0 }}
            onClick={() => handleCloseModal()}
          >
            <ClearIcon />
          </IconButton>
          <Stack
            direction={"column"}
            justifyContent={"space-between"}
            p={2}
            spacing={1}
          >
            <Typography variant="h6" align="center">
              {i18n.t("scheduleCancelModal.title")}
            </Typography>
            <Typography variant="subtitle1" align="center">
              {i18n.t("scheduleCancelModal.subtitle")}
            </Typography>
            <Stack direction={"row"} justifyContent={"space-between"}>
              <Button variant="contained" onClick={() => remove(true)}>
                Sim, Notificar
              </Button>
              <Button onClick={() => remove(false)}>Não Notificar</Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default ScheduleCancelModal;
