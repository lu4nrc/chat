import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../services/api";
import { useToast } from "@/hooks/use-toast";
import toastError from "@/errors/toastError";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

const TagModal = ({ open, setOpen, value }) => {
  const isMounted = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    setOpen(false);
    setTag(initialState);
  };

  const handleSaveNewTag = async (values) => {
    try {
      if (tag?.id) {
        await api.put(`/tags/${tag.id}`, values);
      } else {
        await api.post(`/tags`, values);
      }

      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tags</DialogTitle>
          <DialogDescription>Informações</DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={tag}
          enableReinitialize={true}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .min(2, "Muito curto!")
              .max(40, "Muito longo!")
              .required("Obrigatório"),
          })}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveNewTag(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
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
                <Label htmlFor="profile">Tipo</Label>
                <Select
                  id="typetag"
                  name="typetag"
                  onValueChange={(value) => {
                    setFieldValue("typetag", value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {typestag.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option === "user"
                          ? "Usuário"
                          : option === "enterprise"
                          ? "Empresa"
                          : option === "custom"
                          ? "Customizado"
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 w-full justify-end col-span-2 pt-2">
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {isSubmitting && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-white" />
                  )}
                  {value ? `Editar` : `Adicionar`}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default TagModal;
