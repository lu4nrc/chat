import { Field, FieldArray, Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

import { i18n } from "../../translate/i18n";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { PhoneInputUi } from "../ui/phone-input";

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  email: Yup.string().email("Email inválido"),
});

const ContactModal = ({
  open,
  onOpenChange,
  contactId,
  initialValues,
  onSave,
}) => {
  const isMounted = useRef(true);
  const initialState = {
    name: "",
    number: "",
    email: "",
    extraInfo: [],
  };
  const { toast } = useToast();

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
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onOpenChange(false);
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        // await api.put(`/contacts/${contactId}`, values);
        console.log(values);
        handleClose();
      } else {
        const { data } = await api.post("/contacts", values);
        if (onSave) {
          // onSave(data);
        }
        handleClose();
      }
      toast({
        variant: "success",
        title: "Sucesso!",
        description: i18n.t("contactModal.success"),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>
            {contactId ? `Editar contato` : "Adicionar contato"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
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
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <div className="grid  gap-2">
                  <div className="grid w-full items-center gap-1.5 relative pb-1">
                    <Label htmlFor="name">Nome do contato</Label>
                    <Field
                      as={Input}
                      name="name"
                      fullWidth
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Número do Whatsapp</Label>
                    <PhoneInputUi
                      value={values.number} // Passa o valor atual do campo
                      onChange={(value) => {
                        console.log(value);
                        setFieldValue("number", value);
                      }} // Atualiza o estado de Formik
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Email</Label>
                    <Field
                      size="small"
                      as={Input}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      fullWidth
                      margin="dense"
                      variant="outlined"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full justify-end   col-span-2 pt-2">
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
                    {isSubmitting && "Salvando.."}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
