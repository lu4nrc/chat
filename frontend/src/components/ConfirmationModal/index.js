import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React from "react";


const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent dividers>
        <Typography>{children}</Typography>
      </DialogContent>
       <DialogActions>
        <Button
          variant="outlined"
          onClick={() => onClose(false)}
        >
         Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose(false);
            onConfirm();
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
