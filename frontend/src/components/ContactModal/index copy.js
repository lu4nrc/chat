import { Field, FieldArray, Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";

import * as Yup from "yup";



import { i18n } from "../../translate/i18n";


import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useToast } from "@/hooks/use-toast";

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  number: Yup.string().min(8, "Muito curto!").max(50, "Muito longo!"),
  email: Yup.string().email("Email inválido"),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
  const { toast } = useToast()
  const isMounted = useRef(true);
  const initialState = {
    name: "",
    number: "",
    email: "",
    extraInfo: [],
  };

  const [contact, setContact] = useState(initialState);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!contactId) return;

      try {
        
        const { data } = await api.get(`/contacts/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        const errorMsg =
        err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contacts/${contactId}`, values);
        handleClose();
      } else {
        const { data } = await api.post("/contacts", values);
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("contactModal.success"), {
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
  };

  return (
    <Stack>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {contactId
            ? `${i18n.t("contactModal.title.edit")}`
            : "Adicionar contato"}
        </DialogTitle>
        <Formik
          initialValues={contact}
          enableReinitialize={true}
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContact(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                {/*                 <Typography variant="subtitle1" gutterBottom>
                  {i18n.t("contactModal.form.mainInfo")}
                </Typography> */}
                <Stack spacing={1}>
                  <Stack direction={"row"} spacing={1}>
                    <Stack flex={1} spacing={0.5}>
                      <Typography fontWeight={"bold"} variant="body2">
                        Nome
                      </Typography>
                      <Field
                      size="small"
                        as={TextField}
                        name="name"
                        fullWidth
                        autoFocus
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                        className={""}
                      />
                    </Stack>
                    <Stack flex={1} spacing={0.5}>
                      <Typography fontWeight={"bold"} variant="body2">
                        Número do Whatsapp
                      </Typography>
                      <Field
                      size="small"
                        as={TextField}
                        fullWidth
                        name="number"
                        error={touched.number && Boolean(errors.number)}
                        helperText={touched.number && errors.number}
                        placeholder="5563912344321"
                        variant="outlined"
                        margin="dense"
                      />
                    </Stack>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={"bold"} variant="body2">
                      Email
                    </Typography>
                    <Field
                    size="small"
                      as={TextField}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      fullWidth
                      margin="dense"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography fontWeight={"bold"} variant="body1">
                    Informações adicionais
                  </Typography>

                  <FieldArray name="extraInfo">
                    {({ push, remove }) => (
                      <>
                        {values.extraInfo &&
                          values.extraInfo.length > 0 &&
                          values.extraInfo.map((info, index) => (
                            <Stack
                              justifyContent={"center"}
                              direction={"row"}
                              spacing={1}
                              key={`${index}-info`}
                            >
                              <Stack spacing={0.5}>
                                <Typography fontWeight={"bold"} variant="body2">
                                  Nome do campo
                                </Typography>
                                <Field
                                size="small"
                                  as={TextField}
                                  name={`extraInfo[${index}].name`}
                                  variant="outlined"
                                  margin="dense"
                                  className={""}
                                />
                              </Stack>
                              <Stack spacing={0.5}>
                                <Typography fontWeight={"bold"} variant="body2">
                                  Resposta
                                </Typography>
                                <Field
                                size="small"
                                  as={TextField}
                                  name={`extraInfo[${index}].value`}
                                  variant="outlined"
                                  margin="dense"
                                  className={""}
                                />
                              </Stack>
                              <Stack spacing={0.5} justifyContent={"center"}>
                                <div></div>
                                <IconButton
                                  size="small"
                                  onClick={() => remove(index)}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Stack>
                            </Stack>
                          ))}
                        <Stack>
                          <Button
                            sx={{ flex: 1, marginTop: 8 }}
                            variant="outlined"
                            color="primary"
                            onClick={() => push({ name: "", value: "" })}
                          >
                            {`+ ${i18n.t("contactModal.buttons.addExtraInfo")}`}
                          </Button>
                        </Stack>
                      </>
                    )}
                  </FieldArray>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="text"
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={""}
                >
                  {contactId
                    ? `${i18n.t("contactModal.buttons.okEdit")}`
                    : `${i18n.t("contactModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress size={24} className={""} />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Stack>
  );
};

export default ContactModal;
