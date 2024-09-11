import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import ContactModal from "../ContactModal";
import formatarNumeroTelefone from "../../utils/numberFormat";

import { MessageSquarePlus } from "lucide-react";
import ComboboxWithSearch from "../ui/combobox-demo";

const NewTicketModal = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({});
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user.id,
        status: "open",
        isOutbound: true,
      });
      setSelectedContact("");
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MessageSquarePlus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar novo Atendimento</DialogTitle>
          <DialogDescription>
            Digite o nome do contato para pesquisar
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <ComboboxWithSearch setContactId={setSelectedContact} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={() => handleSaveTicket(selectedContact)}>
              Iniciar atendimento
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTicketModal;
