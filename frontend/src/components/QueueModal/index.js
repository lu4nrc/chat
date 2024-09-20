import { Field, Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";



import { i18n } from "../../translate/i18n";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import ColorPicker from "../ColorPicker";
import { useToast } from "@/hooks/use-toast";

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto!")
    .max(50, "Nome muito longo!")
    .required("Obrigatório"),
  color: Yup.string()
    .min(3, "Nome muito curto!")
    .max(9, "Nome muito longo!")
    .required(),
  greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
  const { toast } = useToast();

  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const greetingRef = useRef();

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
      });
    };
  }, [queueId, open]);

  const handleClose = () => {
    onClose();
    setQueue(initialState);
  };

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, values);
      } else {
        await api.post("/queue", values);
      }
      toast.success("Departamento salvo com sucesso", {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
      handleClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
    }
  };

  return (
    <div /* className={classes.root} */>
      {/*   <Dialog open={open} onClose={handleClose} scroll="paper">
        <DialogTitle>
          {queueId ? `Editar departamento` : `Adicionar departamento`}
        </DialogTitle>
        <Formik
          initialValues={queue}
          enableReinitialize={true}
          validationSchema={QueueSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQueue(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
                <Stack  spacing={2}>
                  <Stack direction={"row"} spacing={1}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">
                        Nome de identificação
                      </Typography>
                      <Field
                        as={TextField}
                        autoFocus
                        name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                      />
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Cor</Typography>
                      <Field
                        as={TextField}
                        name="color"
                        id="color"
                        onFocus={() => {
                          setColorPickerModalOpen(true);
                          greetingRef.current.focus();
                        }}
                        error={touched.color && Boolean(errors.color)}
                        helperText={touched.color && errors.color}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <div
                                style={{ backgroundColor: values.color }}
                               
                              ></div>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => setColorPickerModalOpen(true)}
                            >
                              <Colorize />
                            </IconButton>
                          ),
                        }}
                        variant="outlined"
                        margin="dense"
                      />
                    </Stack>
                  </Stack>
                  <ColorPicker
                    open={colorPickerModalOpen}
                    handleClose={() => setColorPickerModalOpen(false)}
                    onChange={(color) => {
                      values.color = color;
                      setQueue((prevValues) => {
                        return { ...prevValues, color };
                      });
                    }}
                  />
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      Mensagem de saudação
                    </Typography>
                    <Field
                      as={TextField}
                      type="greetingMessage"
                      multiline
                      inputRef={greetingRef}
                      rows={5}
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
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("queueModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                 
                >
                  {queueId
                    ? `${i18n.t("queueModal.buttons.okEdit")}`
                    : `${i18n.t("queueModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                     
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog> */}
    </div>
  );
};

export default QueueModal;
