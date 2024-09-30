import React, { useContext, useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { i18n } from "../../translate/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
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
import MultipleSelector from "../ui/multiple-selector"; // Importando o selector

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
    imageUrl: "",
    queues: [],
  };

  const { user: loggedInUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const { loading, whatsApps } = useWhatsApps();
  const { toast } = useToast();
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toast.error("Erro ao buscar filas");
      }
    };

    fetchQueues();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return setUser(initialState);

      try {
        const { data } = await api.get(`/users/${userId}`);
        setSelectedQueueIds(data.queues || []);
        setUser(data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleClose = () => {
    setOpen(false);
    setUser(initialState);
    setSelectedQueueIds([]);
  };

  const handleSaveUser = async (values) => {
    const ids = selectedQueueIds.map((queue) => queue.id);
    const userData = { ...values, queueIds: ids };

    try {
      let imageUrl = userData.imageUrl;

      if (values.image) {
        const formData = new FormData();
        formData.append("image", values.image);

        const response = await api.post("/users/profile-image/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = response.data.imageUrl;
      }
      if (userId) {
        await api.put(`/users/${userId}`, { ...userData, imageUrl });
      } else {
        const response = await api.post("/users", { ...userData, imageUrl });
        setUser({ ...user, id: response.data.id });
      }
      toast({
        variant: "success",
        title: "Usuário salvo com sucesso!",
        description: "Parabéns! Seu usuário foi criado com sucesso.",
      });
      setOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[612px]">
        <DialogHeader>
          <DialogTitle>Usuário</DialogTitle>
          <DialogDescription>Informações</DialogDescription>
        </DialogHeader>
        {user && (
          <Formik
            initialValues={user}
            enableReinitialize={true}
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              handleSaveUser(values);
              actions.setSubmitting(false);
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
                  <Label htmlFor="image">Imagem de perfil</Label>
                  <Input
                    type="file"
                    name="image"
                    onChange={(event) => {
                      setFieldValue("image", event.currentTarget.files[0]);
                    }}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5 relative pb-5">
                  <Label htmlFor="password">Senha</Label>
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
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="profile">Perfil</Label>
                  <Select
                    id="profile-selection"
                    name="profile"
                    defaultValue={user.profile}
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
                  <Label htmlFor="whatsappId">Definir conexão padrão</Label>
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
                        <SelectItem
                          key={whatsapp.id}
                          value={String(whatsapp.id)}
                        >
                          {whatsapp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Departamentos</Label>
                  <MultipleSelector
                    defaultOptions={queues}
                    value={selectedQueueIds}
                    onChange={setSelectedQueueIds}
                    placeholder="Selecionar departamentos ou filas.."
                    emptyIndicator={
                      <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                        Departamento ou fila não encontrado.
                      </p>
                    }
                  />
                </div>

                <div className="flex gap-2 w-full justify-end col-span-2 pt-2">
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
                    {isSubmitting && "salvando.."}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
