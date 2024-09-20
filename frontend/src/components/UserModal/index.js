import React, { useContext, useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { i18n } from "../../translate/i18n";


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

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";

import QueueSelect from "../QueueSelect";
import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { description } from "@/pages/Dashboard/components/Outin";

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto!")
    .max(50, "Nome muito longo!")
    .required("Obrigatório"),
  password: Yup.string()
    .min(5, "Nome muito curto!")
    .max(50, "Nome muito longo!"),
  email: Yup.string().email("Email inválido").required("Obrigatório"),
});

const UserModal = ({ userId, open, setOpen }) => {
  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
  };

  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);

  const [whatsappId, setWhatsappId] = useState(false);
  const { loading, whatsApps } = useWhatsApps();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return setUser(initialState);

      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser((prevState) => {
          return { ...prevState, ...data };
        });
        const userQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(userQueueIds);
        setWhatsappId(data.whatsappId ? data.whatsappId : "");
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response.data.error;

        toast({
          variant: "destructive",
          title: errorMsg,
        });
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleClose = () => {
    setOpen(false);
    setUser(initialState);
  };

  const handleSaveUser = async (values) => {
    const ids = selectedQueueIds.map((queue) => queue.id);
    const userData = { ...values, queueIds: ids };

    try {
      let imageUrl = "";

      if (values.image) {
        const formData = new FormData();
        formData.append("image", values.image);

        const response = await api.post("/users/profile-image/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = response.data.imageUrl; // URL retornada pelo backend
      }

      if (userId) {
        // Editando usuário existente
        await api.put(`/users/${userId}`, { ...userData, imageUrl });
      } else {
        // Criando novo usuário
        const response = await api.post("/users", { ...userData, imageUrl });
        // Atualiza userId após criação
        setUser({ ...user, id: response.data.id });
      }
      toast({
        variant: "success",
        title: "Usuário salvo com sucesso!",
        description:
          "Parabéns! Seu usuário foi criado com sucesso. Agora já pode aproveitar todas as funcionalidades. Bem-vindo a bordo!",
      });
      setOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response.data.error;
      const errorType = err.response?.data?.type || err.response.data.type;
      toast({
        variant: "destructive",
        title: errorMsg,
        description:
          "Parece que esse e-mail já está sendo usado. Talvez você possa tentar outro?",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        {isEdit ? <Edit /> : <Button>Criar novo usuário</Button>}
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[612px]">
        <DialogHeader>
          <DialogTitle>Usuário</DialogTitle>
          <DialogDescription>Informações</DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveUser(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, setFieldValue }) => (
            <Form className="grid grid-cols-2 gap-1 gap-x-4">
              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="name">Nome</Label>
                <Field
                  as={Input}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <ErrorMessage name="name">
                  {(msg) => (
                    <div className="text-xs text-red-500 absolute bottom-0">
                      {msg}
                    </div>
                  )}
                </ErrorMessage>
              </div>

              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="imageUrl">Imagem de perfil</Label>
                <Input
                  type="file"
                  name="image"
                  onChange={(event) => {
                    setFieldValue("image", event.currentTarget.files[0]);
                  }}
                />
              </div>

              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="name">Senha</Label>
                <Field
                  as={Input}
                  type="password"
                  name="password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
                <ErrorMessage name="password">
                  {(msg) => (
                    <div className="text-xs text-red-500 absolute bottom-0">
                      {msg}
                    </div>
                  )}
                </ErrorMessage>
              </div>

              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="name">Email</Label>
                <Field
                  as={Input}
                  type="email"
                  name="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <ErrorMessage name="email">
                  {(msg) => (
                    <div className="text-xs text-red-500 absolute bottom-0">
                      {msg}
                    </div>
                  )}
                </ErrorMessage>
              </div>

              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="name">Perfil</Label>
                <Select
                  id="profile-selection"
                  name="profile"
                  onValueChange={(value) => {
                    setFieldValue("profile", value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full items-center gap-1.5 relative pb-5">
                <Label htmlFor="name">Definir conexão padrão</Label>
                <Select
                  id="whatsappId"
                  name="whatsappId"
                  onValueChange={(value) => {
                    setFieldValue("whatsappId", Number(value));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Conexão padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    {whatsApps.map((whatsapp) => (
                      <SelectItem value={String(whatsapp.id)}>
                        {whatsapp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={(values) => setSelectedQueueIds(values)}
                />
              </div>

              <div className="flex gap-2 w-full justify-end   col-span-2 pt-2">
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {userId
                    ? `${i18n.t("userModal.buttons.okEdit")}`
                    : `${i18n.t("userModal.buttons.okAdd")}`}
                  {isSubmitting && "aguardando.."}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
