import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Formik, Form } from "formik";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as Yup from "yup";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ComboboxUser from "../ui/combobox-user";
import { useToast } from "@/hooks/use-toast";

// Validação de formulário usando Yup
const TransferSchema = Yup.object().shape({
  queueId: Yup.string().required("Obrigatório"),
  whatsappId: Yup.string().required("Obrigatório"),
});

const TransferTicketModal = ({ ticketid, ticketWhatsappId }) => {
  const { toast } = useToast()
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);

  const { findAll: findAllQueues } = useQueues();
  const { loadingWhatsapps, whatsApps } = useWhatsApps();
  const { user: loggedInUser } = useContext(AuthContext);

  const [queues, setQueues] = useState([]);

  const [allQueues, setAllQueues] = useState([]);

  useEffect(() => {
    const loadQueues = async () => {
      const list = await findAllQueues();
      setAllQueues(list);
      setQueues(list);
    };
    loadQueues();
  }, []);

  useEffect(() => {
    if (user != null && Array.isArray(user.queues)) {
      setQueues(user.queues);
    } else {
      setQueues(allQueues);
    }
  }, [user]);

  const handleSaveTicket = async (values, actions) => {
    if (!ticketid) return;

    setLoading(true);
    try {
      const data = {
        queueId: values.queueId,
        whatsappId: values.whatsappId,
        userId: user.id || null,
        status: values.queueId && !user.id ? "pending" : undefined,
      };
      await api.put(`/tickets/${ticketid}`, data);
      setLoading(false);
      navigate(`/tickets`);
      actions.setSubmitting(false);
    } catch (err) {
      setLoading(false);
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
      actions.setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Transferir atendimento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir Atendimento</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            queueId: "",
            whatsappId: ticketWhatsappId || "",
            userId: null,
          }}
          validationSchema={TransferSchema}
          onSubmit={handleSaveTicket}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="space-y-4">
              <ComboboxUser setUser={setUser} />

              <Select
                id="queueId"
                name="queueId"
                onValueChange={(value) => {
                  setFieldValue("queueId", Number(value));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {queues.map((queue) => (
                    <SelectItem key={queue.id} value={String(queue.id)}>
                      {queue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!loadingWhatsapps && (
                <Select
                  id="whatsappId"
                  name="whatsappId"
                  onValueChange={(value) => {
                    setFieldValue("whatsappId", Number(value));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar conexão" />
                  </SelectTrigger>
                  <SelectContent>
                    {whatsApps.map((whatsapp) => (
                      <SelectItem key={whatsapp.id} value={String(whatsapp.id)}>
                        {whatsapp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  variant="text"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "aguarde.." : "Transferir"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default TransferTicketModal;
