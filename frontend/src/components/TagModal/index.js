import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";


import api from "../../services/api";
import { useToast } from "@/hooks/use-toast";
import toastError from "@/errors/toastError";

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(40, "Muito longo!")
    .required("Obrigatório"),
});

const TagModal = ({ open, onClose, value }) => {
  const isMounted = useRef(true);
  const toast = useToast()

  const initialState = {
    name: "",
    typetag: "",
    value: "",
  };

  const [tag, setTag] = useState(initialState);
  const typestag = ["user", "enterprise", "custom"];

  useEffect(() => {
    if (value !== null) {
      setTag(value);
    }
    return () => {
      isMounted.current = false;
    };
  }, [value]);

  const handleClose = () => {
    onClose();
    setTag(initialState);
  };

  const handleSaveNewTag = async (values) => {
    try {
      if (tag?.id) {
        await api.put(`/tags/${tag.id}`, values);
      } else {
        await api.post(`/tags`, values);
      }

      handleClose();
      toast({
        variant: "success",
        title: "Sucesso!",
        description: `Tag ${tag.id ? "updated" : "added"}`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  return (
    <div /* className={classes.root} */>
      {/*  <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {tag?.id ? "Editar" : "Criar"}
        </DialogTitle>
        <Formik
          initialValues={tag}
          enableReinitialize={true}
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveNewTag(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Stack direction={"row"} alignItems={"top"} spacing={1}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">Nome</Typography>
                    <Field
                      as={TextField}
                      name="name"
                      autoFocus
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                    />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">Categoria</Typography>
                    <Field
                      as={TextField}
                      style={{ width: "200px" }}
                      select
                      name="typetag"
                      error={touched.number && Boolean(errors.number)}
                      helperText={touched.number && errors.number}
                      placeholder="User/Enterprise/Custom"
                      variant="outlined"
                      margin="dense"
                    >
                      <MenuItem key={""} value={""} disabled></MenuItem>
                      {typestag.map((option, index) => (
                        <MenuItem key={index} value={option}>
                          {option === "user"
                            ? "Usuário"
                            : option === "enterprise"
                            ? "Empresa"
                            : option === "custom"
                            ? "Customizado"
                            : ""}
                        </MenuItem>
                      ))}
                    </Field>
                  </Stack>
                </Stack>
              </DialogContent>

              <DialogActions>
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                
                >
                  Salvar
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

export default TagModal;
