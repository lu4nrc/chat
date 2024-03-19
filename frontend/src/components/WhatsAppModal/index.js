import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import QueueSelect from "../QueueSelect";


const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto!")
    .max(50, "Nome muito longo!")
    .required("Obrigatório"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {

  const initialState = {
    name: "",
    greetingMessage: "",
    farewellMessage: "",
    isDefault: false,
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}`);
        setWhatsApp(data);

        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(whatsQueueIds);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = { ...values, queueIds: selectedQueueIds };

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp", whatsappData);
      }
      toast.success(i18n.t("whatsappModal.success"), {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
  };

  return (
    <Stack>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId ? "Editar conexão" : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Stack spacing={1}>
                  <Stack spacing={0.5} direction={"row"}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">
                        Nome de identificação
                      </Typography>
                      <Field
                        as={TextField}
                        autoFocus
                        size="small"
                        name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                      />
                    </Stack>
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          color="primary"
                          name="isDefault"
                          checked={values.isDefault}
                        />
                      }
                      label="Definir como Padrão"
                    />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      Mensagem de saudação
                    </Typography>
                    <Field
                      as={TextField}
                      type="greetingMessage"
                      multiline
                      rows={3}
                      fullWidth
                      name="greetingMessage"
                      error={
                        touched.greetingMessage &&
                        Boolean(errors.greetingMessage)
                      }
                      helperText={
                        touched.greetingMessage && errors.greetingMessage
                      }
                      variant="outlined"
                      margin="dense"
                    />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      Mensagem de finalização
                    </Typography>
                    <Field
                      as={TextField}
                      type="farewellMessage"
                      placeholder={i18n.t(
                        "whatsappModal.form.farewellMessageLabel"
                      )}
                      multiline
                      rows={3}
                      fullWidth
                      name="farewellMessage"
                      error={
                        touched.farewellMessage &&
                        Boolean(errors.farewellMessage)
                      }
                      helperText={
                        touched.farewellMessage && errors.farewellMessage
                      }
                      variant="outlined"
                      margin="dense"
                    />
                  </Stack>

                  <QueueSelect
                    selectedQueueIds={selectedQueueIds}
                    onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="text"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                  {isSubmitting && <CircularProgress size={24} />}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Stack>
  );
};

export default React.memo(WhatsAppModal);
