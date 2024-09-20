import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { i18n } from "../../translate/i18n";

import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";

import api from "../../services/api";

import QueueSelect from "../QueueSelect";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const longText = `
Desmarque esta opção para definir um horário de expediente para os atendimentos.
Quando um usuário escolher ser direcionado a um atendente, o sistema irá
verificar o horário e o dia, se estiver fora do expediente, envia um aviso
ao usuário e não direciona ao atendente escolhido.
`;

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(25, "Muito longo!")
    .required("Obrigatório"),
});

const WhatsAppModal = ({ whatsAppId, isEdit }) => {
  const [open, setOpen] = useState(false);

  const initialState = {
    name: "",
    greetingMessage: "",
    farewellMessage: "",
    isDefault: false,
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const { toast } = useToast()

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}`);
        setWhatsApp(data);
        setSelectedQueueIds(data.queues);
      } catch (err) {
        const errorMsg =
        err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
      }
    };
    fetchSession();
  }, [whatsAppId]);

  const handleSaveWhatsApp = async (values) => {
    const ids = selectedQueueIds.map((department) => department.id);
    const whatsappData = { ...values, queueIds: ids };

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
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Edit />
        ) : (
          <Button>{i18n.t("connections.buttons.add")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[612px]">
        <DialogHeader>
          <DialogTitle>
            {whatsAppId
              ? i18n.t("whatsappModal.title.edit")
              : i18n.t("whatsappModal.title.add")}
          </DialogTitle>
          <DialogDescription>Informações</DialogDescription>
        </DialogHeader>

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
            <Form className="grid gap-2">
              <div className="flex gap-2">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">
                    {i18n.t("whatsappModal.form.name")}
                  </Label>
                  <Field
                    as={Input}
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <ErrorMessage name="name">
                    {(msg) => <div className="text-xs text-red-500">{msg}</div>}
                  </ErrorMessage>
                </div>

                <div className="flex justify-center items-center gap-1.5">
                  <Label htmlFor="isDefault">
                    {i18n.t("whatsappModal.form.default")}
                  </Label>
                  <Field name="isDefault">
                    {({ field, form }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          form.setFieldValue("isDefault", checked)
                        }
                      />
                    )}
                  </Field>
                </div>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="greetingMessage">
                  {i18n.t("queueModal.form.greetingMessage")}
                </Label>
                <Field
                  as={Textarea}
                  type="greetingMessage"
                  rows={2}
                  name="greetingMessage"
                  error={
                    touched.greetingMessage && Boolean(errors.greetingMessage)
                  }
                  helperText={touched.greetingMessage && errors.greetingMessage}
                />
                <ErrorMessage name="greetingMessage">
                  {(msg) => <div className="text-xs text-red-500">{msg}</div>}
                </ErrorMessage>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="farewellMessage">
                  {i18n.t("whatsappModal.form.farewellMessage")}
                </Label>
                <Field
                  as={Textarea}
                  type="farewellMessage"
                  rows={2}
                  name="farewellMessage"
                  error={
                    touched.farewellMessage && Boolean(errors.farewellMessage)
                  }
                  helperText={touched.farewellMessage && errors.farewellMessage}
                />
                <ErrorMessage name="farewellMessage">
                  {(msg) => <div className="text-xs text-red-500">{msg}</div>}
                </ErrorMessage>
              </div>

              <QueueSelect
                selectedQueueIds={selectedQueueIds}
                onChange={setSelectedQueueIds}
              />

              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button
                    disabled={isSubmitting}
                    type="button"
                    variant="secondary"
                  >
                    {i18n.t("whatsappModal.buttons.cancel")}
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={isSubmitting}>
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                  {isSubmitting && <span>Loading..</span>}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppModal;
