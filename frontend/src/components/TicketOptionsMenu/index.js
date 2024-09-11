import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, EllipsisVertical, Trash } from "lucide-react";

const TicketOptionsMenu = ({ ticket }) => {
  const [open, setOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
    setOpen(false);
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} id="TicketsOptions">
        <DropdownMenuTrigger>
          <EllipsisVertical onClick={() => setOpen(true)} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {user.profile === "admin" && (
            <ConfirmationModal
              btn_title="Apagar atendimento"
              message={
                "Atenção! Todas as mensagens associadas a este atendimento serão perdidas. Tem certeza de que deseja continuar?"
              }
              title={`Deletar atendimento nº${ticket.id}, contato ${ticket.contact.name}?`}
              onConfirm={handleDeleteTicket}
            />
          )}

          <DropdownMenuItem
            onClick={handleOpenTransferModal}
            className="flex gap-2"
          >
            Transferir atendimento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransferTicketModal
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
      />
    </>
  );
};

export default TicketOptionsMenu;
