import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";

import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  number: Yup.string().min(8, "Muito curto!").max(50, "Muito longo!"),
  email: Yup.string().email("Email inválido"),
});

const ContactModal = ({ open, onOpenChange, contactId, onSave }) => {
  const initialState = {
    name: "",
    number: "",
    email: "",
    extraInfo: [],
  };
  const { toast } = useToast();

  const [contact, setContact] = useState(initialState);

  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) return;

      try {
        const { data } = await api.get(`/contacts/${contactId}`);
        setContact(data); // Atualiza o estado do contato com os dados recebidos
      } catch (err) {
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    };

    fetchContact();
  }, [contactId]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contacts/${contactId}`, values);
      } else {
        const { data } = await api.post("/contacts", values);
        if (onSave) onSave(data);
      }

      toast({
        variant: "success",
        title: "Sucesso!",
        description: i18n.t("contactModal.success"),
      });
      handleClose();
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
            {contactId ? "Editar contato" : "Adicionar contato"}
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={contact} // Usa o estado do contato como initialValues
          enableReinitialize={true} // Permite reinicializar quando o estado do contato muda
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            handleSaveContact(values);
            actions.setSubmitting(false);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="flex flex-col">
              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="name">Nome do contato</Label>
                <Field
                  as={Input}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
              </div>

              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="number">Número do Whatsapp</Label>
                <Field
                  as={Input}
                  type="number"
                  name="number"
                  placeholder="556392xxxxxx"
                />
              </div>

              {/*        <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="email">Email</Label>
                <Field
                  as={Input}
                  name="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </div> */}

              <div className="flex gap-2 w-full justify-end pt-2">
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {contactId
                    ? i18n.t("contactModal.buttons.okEdit")
                    : i18n.t("contactModal.buttons.okAdd")}
                  {isSubmitting && "Salvando..."}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
