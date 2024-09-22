import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import openSocket from "../../services/socket-io";

import MessageInput from "../MessageInput/";

import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactDrawer from "../ContactDrawer";
import MessagesList from "../MessagesList";
import TicketActionButtons from "../TicketActionButtons";

import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Ticket = () => {
  const [activeRating] = useOutletContext();

  console.log(activeRating);
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
const toast = useToast()

  useEffect(() => {
    setLoading(true);

    const fetchTicket = async () => {
      try {
        const { data } = await api.get("/tickets/" + ticketId);
        setContact(data.contact);
        setTicket(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    };
    fetchTicket();
  }, [ticketId, navigate]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("ticket", (data) => {
      if (data.action === "update") {
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast({
          variant: "success",
          title: "Sucesso!",
          description: "atendimento excluído com sucesso.",
        });
        navigate("/tickets");
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, navigate]);

  return (
    <ReplyMessageProvider>
      <div className="grid grid-rows-[auto_1fr_auto] h-screen justify-items-center">
        <div className="bg-muted p-1  w-full">
          <div className="flex gap-1 items-center">
            <ContactDrawer
              contact={contact}
              loading={loading}
              photo={contact.profilePicUrl}
            />
            <div className="flex-1 flex  justify-between items-center">
              <div className="flex flex-col">
                <p className="text-lg text-foreground font-medium  leading-4">
                  {contact.name}
                </p>
                {ticket.user?.name && (
                  <p className="text-sm font-medium text-muted-foreground">
                    Atribuído a: {ticket.user?.name}
                  </p>
                )}
              </div>
              <TicketActionButtons ticket={ticket} activeRating={activeRating}/>
            </div>
          </div>
          <div className="cursor-pointer flex gap-1 flex-wrap">
            {loading
              ? null
              : contact.tagslist?.map((e, i) => {
                  return (
                    <div key={i}>
                      <Badge
                        className={cn(
                          e.typetag === "user"
                            ? "bg-primary"
                            : e.typetag === "enterprise"
                            ? "bg-slate-900"
                            : "bg-slate-400"
                        )}
                      >
                        {e.name}
                      </Badge>
                    </div>
                  );
                })}
          </div>
        </div>

        <MessagesList ticketId={ticketId} isGroup={ticket.isGroup} />

        <MessageInput ticketStatus={ticket.status} />
      </div>
    </ReplyMessageProvider>
  );
};

export default Ticket;
