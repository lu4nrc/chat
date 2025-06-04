import React, { useEffect } from "react"; // Removed useState
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import TanStack Query hooks

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
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchTicketQueryFn = async () => {
    const { data } = await api.get(`/tickets/${ticketId}`);
    return data; // API returns the ticket object which includes contact, user, etc.
  };

  const {
    data: ticketData,
    isLoading: isLoadingTicket,
    isError: isErrorTicket,
    error: ticketError
  } = useQuery(
    ['ticket', ticketId],
    fetchTicketQueryFn,
    {
      // staleTime: 1000 * 60 * 1, // Optional: 1 minute
      // refetchOnWindowFocus: false, // Optional
      onError: (err) => {
        toast({
          variant: "destructive",
          title: toastError(err), // Use the error from useQuery
        });
        // Optionally navigate away if ticket fetch fails critically
        // navigate("/tickets");
      }
    }
  );

  // Extract ticket and contact from ticketData
  // Based on ShowTicketService.ts, the response 'data' is the ticket object itself.
  const ticket = ticketData;
  const contact = ticketData?.contact;
  const loading = isLoadingTicket; // Use isLoadingTicket for loading state

  useEffect(() => {
    const socket = openSocket();
    const queryKey = ['ticket', ticketId];

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("ticket", (data) => {
      if (data.action === "update") {
        queryClient.setQueryData(queryKey, (oldQueryData) => {
          if (!oldQueryData) return oldQueryData;
          // Assuming data.ticket contains all updated fields for the ticket
          return { ...oldQueryData, ...data.ticket };
        });
      }

      if (data.action === "delete") {
        queryClient.removeQueries(queryKey);
        toast({
          variant: "success",
          title: "Sucesso!",
          description: "Atendimento excluído com sucesso.",
        });
        navigate("/tickets");
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        queryClient.setQueryData(queryKey, (oldQueryData) => {
          if (!oldQueryData || !oldQueryData.contact || oldQueryData.contact.id !== data.contact?.id) {
            return oldQueryData;
          }
          return {
            ...oldQueryData,
            contact: { ...oldQueryData.contact, ...data.contact },
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, navigate, queryClient, toast]); // Added queryClient and toast to dependencies

  // Handle loading and error states explicitly for clarity
  if (loading) {
    // You might want a more sophisticated loading skeleton here
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (isErrorTicket) {
    // Error is already toasted by useQuery's onError.
    // You could show a specific error message here or navigate away.
    // For now, assuming toast is enough and component might not render further or show a generic error.
    return <div className="flex justify-center items-center h-screen">Erro ao carregar ticket.</div>;
  }

  if (!ticket) {
    // This case might occur if data is undefined after loading and no error (e.g. ticket deleted before load)
    return <div className="flex justify-center items-center h-screen">Ticket não encontrado.</div>;
  }


  return (
    <ReplyMessageProvider>
      <div className="grid grid-rows-[auto_1fr_auto] h-screen justify-items-center">
        <div className="bg-muted p-1  w-full">
          <div className="flex gap-1 items-center">
            <ContactDrawer
              contact={contact || {}} // Pass empty object if contact is undefined
              loading={loading} // Use derived loading state
              photo={contact?.profilePicUrl}
            />
            <div className="flex-1 flex  justify-between items-center">
              <div className="flex flex-col">
                <p className="text-lg text-foreground font-medium  leading-4">
                  {contact?.name}
                </p>
                {ticket?.user?.name && (
                  <p className="text-sm font-medium text-muted-foreground">
                    Atribuído a: {ticket.user?.name}
                  </p>
                )}
              </div>
              <TicketActionButtons
                ticket={ticket}
                activeRating={activeRating}
              />
            </div>
          </div>
          <div className="cursor-pointer flex gap-1 flex-wrap">
            {loading // Use derived loading state
              ? null
              : contact?.tagslist?.map((e, i) => {
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

        <MessagesList ticketId={ticketId} isGroup={ticket?.isGroup} />

        <MessageInput ticketStatus={ticket?.status} />
      </div>
    </ReplyMessageProvider>
  );
};

export default Ticket;
