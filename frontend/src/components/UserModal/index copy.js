import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import { Can } from "../Can";
import QueueSelect from "../QueueSelect";
import { useToast } from "@/hooks/use-toast";

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

const UserModal = ({ open, onClose, userId }) => {
  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
  };

  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappId, setWhatsappId] = useState(false);
  const { loading, whatsApps } = useWhatsApps();
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser((prevState) => {
          return { ...prevState, ...data };
        });
        const userQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(userQueueIds);
        setWhatsappId(data.whatsappId ? data.whatsappId : "");
      } catch (err) {
        const errorMsg =
        err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleClose = () => {
    onClose();
    setUser(initialState);
  };

  const handleSaveUser = async (values) => {
    const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
    try {
      if (userId) {
        await api.put(`/users/${userId}`, userData);
      } else {
        await api.post("/users", userData);
      }
      toast.success("Usuário salvo");
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        
        <DialogTitle id="form-dialog-title">
          {userId
            ? `${i18n.t("userModal.title.edit")}`
            : `${i18n.t("userModal.title.add")}`}
        </DialogTitle>
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
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <Stack px={1.5} pt={1} spacing={2}>
                <Stack direction={"row"} spacing={1}>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="subtitle2">Nome</Typography>
                    <Field
                    size="small"
                      as={TextField}
                      autoFocus
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Stack>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="subtitle2">Senha</Typography>
                    <Field
                    size="small"
                      as={TextField}
                      name="password"
                      variant="outlined"
                      margin="dense"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      type={showPassword ? "text" : "password"}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((e) => !e)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Stack>
                </Stack>
                <Stack direction={"row"} spacing={1}>
                  <Stack spacing={0.5} flex={2}>
                    <Typography variant="subtitle2">Email</Typography>
                    <Field
                    size="small"
                      as={TextField}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Stack>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="subtitle2">Perfil</Typography>
                    <Can
                      role={loggedInUser.profile}
                      perform="user-modal:editProfile"
                      yes={() => (
                        <>
                          <Field
                          size="small"
                            as={Select}
                            defaultValue=""
                            name="profile"
                            labelId="profile-selection-label"
                            id="profile-selection"
                            required
                          >
                            <MenuItem value="admin">Administrador</MenuItem>
                            <MenuItem value="user">Usuário</MenuItem>
                          </Field>
                        </>
                      )}
                    />
                  </Stack>
                </Stack>
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() => (
                    <QueueSelect
                    
                      defaultValue=""
                      selectedQueueIds={selectedQueueIds}
                      onChange={(values) => setSelectedQueueIds(values)}
                    />
                  )}
                />
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() =>
                    !loading && (
                      <Stack spacing={0.5} flex={1}>
                        <Typography variant="subtitle2">
                          Conexão padrão
                        </Typography>
                        <Field
                        size="small"
                          as={Select}
                          value={whatsappId}
                          onChange={(e) => setWhatsappId(e.target.value)}
                        >
                          <MenuItem value={""}>&nbsp;</MenuItem>
                          {whatsApps.map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </Stack>
                    )
                  }
                />
              </Stack>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="text"
                >
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                >
                  {userId
                    ? `${i18n.t("userModal.buttons.okEdit")}`
                    : `${i18n.t("userModal.buttons.okAdd")}`}
                  {isSubmitting && <CircularProgress size={24} />}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default UserModal;
