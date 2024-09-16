import React, { useEffect, useRef, useState } from "react";

import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { i18n } from "../../translate/i18n";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useToast } from "@/hooks/use-toast";

const QuickAnswerSchema = Yup.object().shape({
  shortcut: Yup.string()
    .min(2, "Muito curto!")
    .max(15, "Muito longo!")
    .required("Obrigatório"),
  message: Yup.string()
    .min(8, "Muito curto!")
    .max(30000, "Muito longo!")
    .required("Obrigatório"),
});

const QuickAnswersModal = ({
  open,
  onClose,
  quickAnswerId,
  initialValues,
  onSave,
}) => {
  const { toast } = useToast()
  const isMounted = useRef(true);

  const initialState = {
    shortcut: "",
    message: "",
  };

  const [quickAnswer, setQuickAnswer] = useState(initialState);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchQuickAnswer = async () => {
      if (initialValues) {
        setQuickAnswer((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!quickAnswerId) return;

      try {
        const { data } = await api.get(`/quickAnswers/${quickAnswerId}`);
        if (isMounted.current) {
          setQuickAnswer(data);
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

    fetchQuickAnswer();
  }, [quickAnswerId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setQuickAnswer(initialState);
  };

  const handleSaveQuickAnswer = async (values) => {
    try {
      if (quickAnswerId) {
        await api.put(`/quickAnswers/${quickAnswerId}`, values);
        handleClose();
      } else {
        const { data } = await api.post("/quickAnswers", values);
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("quickAnswersModal.success"));
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
    <div /* className={classes.root} */>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {quickAnswerId
            ? `${i18n.t("quickAnswersModal.title.edit")}`
            : `${i18n.t("quickAnswersModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={quickAnswer}
          enableReinitialize={true}
          validationSchema={QuickAnswerSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickAnswer(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Stack alignItems={"top"} spacing={1}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">Atalho</Typography>
                    <Field
                      as={TextField}
                      name="shortcut"
                      autoFocus
                      error={touched.shortcut && Boolean(errors.shortcut)}
                      helperText={touched.shortcut && errors.shortcut}
                      variant="outlined"
                      margin="dense"
                 
                      fullWidth
                    />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">Resposta Rápida</Typography>

                    <Field
                      as={TextField}
                      name="message"
                      error={touched.message && Boolean(errors.message)}
                      helperText={touched.message && errors.message}
                      variant="outlined"
                      margin="dense"
              
                      multiline
                      rows={5}
                      fullWidth
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
                  {i18n.t("quickAnswersModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
               
                >
                  {quickAnswerId
                    ? `${i18n.t("quickAnswersModal.buttons.okEdit")}`
                    : `${i18n.t("quickAnswersModal.buttons.okAdd")}`}
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
      </Dialog>
    </div>
  );
};

export default QuickAnswersModal;
