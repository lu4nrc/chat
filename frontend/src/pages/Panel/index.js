import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";
import {
  differenceInSeconds,
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import api from "../../services/api";
import { Headset, Loader, Smile, TrafficCone, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Lab from "./Lab";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Outin from "../Dashboard/components/Outin";
import toastError from "@/errors/toastError";

const reducer = (state, action) => {
  //console.log("reducer");
  switch (action.type) {
    case "LOAD_TICKETS":
      const newTickets = action.payload;

      newTickets.forEach((ticket) => {
        const ticketIndex = state.findIndex((t) => t.id === ticket.id);
        if (ticketIndex !== -1) {
          state[ticketIndex] = ticket;
          if (ticket.unreadMessages > 0) {
            state.unshift(state.splice(ticketIndex, 1)[0]);
          }
        } else {
          state.push(ticket);
        }
      });

      return [...state];

    case "RESET_UNREAD":
      const ticketId = action.payload;

      const resetTicketIndex = state.findIndex((t) => t.id === ticketId);
      if (resetTicketIndex !== -1) {
        state[resetTicketIndex].unreadMessages = 0;
      }

      return [...state];

    case "UPDATE_TICKET":
      const updatedTicket = action.payload;

      const updateTicketIndex = state.findIndex(
        (t) => t.id === updatedTicket.id
      );
      if (updateTicketIndex !== -1) {
        state[updateTicketIndex] = updatedTicket;
      } else {
        state.unshift(updatedTicket);
      }

      return [...state];

    case "UPDATE_TICKET_UNREAD_MESSAGES":
      const unreadTicket = action.payload;

      const unreadTicketIndex = state.findIndex(
        (t) => t.id === unreadTicket.id
      );
      if (unreadTicketIndex !== -1) {
        state[unreadTicketIndex] = unreadTicket;
        state.unshift(state.splice(unreadTicketIndex, 1)[0]);
      } else {
        state.unshift(unreadTicket);
      }

      return [...state];

    case "UPDATE_TICKET_CONTACT":
      const contact = action.payload;

      const contactTicketIndex = state.findIndex(
        (t) => t.contactId === contact.id
      );
      if (contactTicketIndex !== -1) {
        state[contactTicketIndex].contact = contact;
      }

      return [...state];

    case "DELETE_TICKET":
      const deleteTicketId = action.payload;

      const deleteTicketIndex = state.findIndex((t) => t.id === deleteTicketId);
      if (deleteTicketIndex !== -1) {
        state.splice(deleteTicketIndex, 1);
      }

      return [...state];

    case "RESET":
      return [];

    default:
      return state;
  }
};

const PanelPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [ticketsList, dispatch] = useReducer(reducer, []);
  //console.log(ticketsList);
  const [ByGroup, setByGroup] = useState({
    byQueue: {},
    byUser: {},
    open: [],
    pending: [],
  });

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        try {
          const { data } = await api.get("/tickets/allOpen", {});

          dispatch({ type: "LOAD_TICKETS", payload: data.tickets });
          //console.log("Fetch...");
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toast({
            variant: "destructive",
            title: toastError(err),
          });
        }
      };

      fetchTickets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => {
      socket.emit("joinTickets", "open");
      socket.emit("joinTickets", "pending");
    });

    socket.on("ticket", (data) => {
      if (data.action === "updateUnread") {
        /*     console.log({
          on: "ticket",
          action: "updateUnread",
          dispatch: "RESET_UNREAD",
          payload: data,
        }); */
        /*    dispatch({
          type: "RESET_UNREAD",
          payload: data.ticketId,
        });  */
      }

      if (data.action === "update") {
        /*    console.log({
          on: "ticket",
          action: "update",
          dispatch: "UPDATE_TICKET",
          payload: data,
        }); */
        dispatch({
          type: "UPDATE_TICKET",
          payload: data.ticket,
        });
      }

      if (data.action === "update") {
        /*   console.log({
          on: "ticket",
          action: "update",
          dispatch: "DELETE_TICKET - OFF",
          payload: data,
        }); */
        // dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
      }

      if (data.action === "delete") {
        /*    console.log({
          on: "ticket",
          action: "delete",
          dispatch: "DELETE_TICKET",
          payload: data,
        }); */
        dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
      }
    });

    socket.on("appMessage", (data) => {
      /* console.log("appMessage") */
      if (data.action === "create" && data.ticket.status === "pending") {
        /*    console.log({
          on: "appMessage",
          action: "create",
          dispatch: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data,
        }); */
        dispatch({
          type: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data.ticket,
        });
      } else {
        /*     console.log({
          on: "appMessage",
          status: data.ticket.status,
          action: "create",
          dispatch: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data,
        }); */
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        /*  console.log({
          on: "contact",
          action: "update",
          dispatch: "UPDATE_TICKET_CONTACT",
          payload: data,
        }); */
        dispatch({
          type: "UPDATE_TICKET_CONTACT",
          payload: data.contact,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* GroupBy */
  useEffect(() => {
    if (!ticketsList || ticketsList.length === 0) return;
    //console.log("ticketsList", ticketsList);
    const group = (tickets) => {
      return tickets.reduce(
        (acc, ticket) => {
          if (ticket.status === "closed") return acc;

          const queueName = ticket.queue ? ticket.queue.name : "não atribuído";
          const userName = ticket.user ? ticket.user.name : null;
          const status = ticket.status;
          const isOutbound = ticket.isOutbound;

          if (isOutbound) {
            acc.outin.outbound++;
          } else {
            acc.outin.inbound++;
          }

          // Agrupando por queue
          if (!acc.byQueue[queueName]) {
            acc.byQueue[queueName] = 0;
          }
          acc.byQueue[queueName]++;

          // Agrupando por user
          if (userName) {
            if (!acc.byUser[userName]) {
              acc.byUser[userName] = 0;
            }
            acc.byUser[userName]++;
          }

          // Verificando status e adicionando ao array correto
          if (status === "open") {
            acc.open.push(ticket);
          } else if (status === "pending") {
            acc.pending.push(ticket);
          }

          return acc;
        },
        {
          byQueue: {},
          byUser: {},
          open: [],
          pending: [],
          outin: { outbound: 0, inbound: 0 },
        }
      );
    };

    const groupedData = group(ticketsList);

    groupedData.open.sort(
      (a, b) => new Date(a.initialDate) - new Date(b.initialDate)
    );
    groupedData.pending.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

   
    setByGroup(groupedData);
  }, [ticketsList]);

  if (!ticketsList) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="w-full h-screen flex flex-col p-2">
        <div className="flex items-center gap-2 pb-2">
          <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            Painel de Acompanhamento
          </h1>
          <Badge className="ml-auto sm:ml-0">Beta</Badge>
        </div>
        <div className="grid grid-cols-3 grid-rows-[auto_1fr]  gap-2 h-screen">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex gap-1 items-center">
                <TrafficCone className="text-orange-500  w-4 h-4" />
                Em manutenção!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p></p>
            </CardContent>
            <CardFooter>
              <p></p>
            </CardFooter>
          </Card>

          <Outin outinData={ByGroup.outin} />

          <ListTicketStatus tickets={ByGroup.pending} status={"pending"} />

          <ListTicketStatus tickets={ByGroup.open} status={"open"} />

          <Card>
            <CardHeader>
              <CardTitle className="flex gap-1 items-center">
                <Users className="text-primary w-4 h-4" /> Dep. e Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-1">
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium">Departamentos</p>
                <ScrollArea className="h-[calc(100vh-380px)] w-full">
                  {Object.entries(ByGroup.byQueue).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_auto] justify-between bg-muted p-1 rounded mb-1"
                    >
                      <p className="text-sm font-medium truncate">{key}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium">Usuários</p>
                <ScrollArea className="h-[calc(100vh-380px)] w-full">
                  {Object.entries(ByGroup.byUser).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_auto] justify-between bg-muted p-1 rounded mb-1"
                    >
                      <p className="text-sm font-medium truncate">{key}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PanelPage;

function ListTicketStatus({ tickets, status }) {
  const filteredTickets = tickets.filter((el) => el.status === status);
  const statusName = status === "open" ? "em aberto" : "aguardando";
  /*  if (filteredTickets.length === 0) {
    return;
  } */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-1 items-center">
          {status === "open" ? (
            <Headset className="text-sky-500 w-4 h-4" />
          ) : (
            <Loader className="text-yellow-500 w-4 h-4" />
          )}
          {status === "open" ? "Em atendimento" : "Aguardando"}
          <p className="text-sm">{filteredTickets.length}</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTickets.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-270px)] w-full ">
            {filteredTickets.map((el) => (
              <ListContactItem key={el.id} ticket={el} status={status} />
            ))}
          </ScrollArea>
        ) : (
          <p>Não temos atendimentos {statusName}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ListContactItem({ ticket, status }) {
  const [timeSinceCreated, setTimeSinceCreated] = useState("");
  const [timeSinceUpdated, setTimeSinceUpdated] = useState("");

  useEffect(() => {
    const updateCounters = () => {
      const now = new Date();
      const created =
        ticket.status === "pending"
          ? new Date(ticket.createdAt)
          : new Date(ticket.acceptDate);
      const updated = new Date(ticket.updatedAt);

      const createdDiff = differenceInSeconds(now, created);
      const updatedDiff = differenceInSeconds(now, updated);

      setTimeSinceCreated(
        createdDiff >= 3600
          ? `Há ${formatDuration(
              intervalToDuration({ start: created, end: now }),
              { format: ["hours", "minutes"], locale: ptBR }
            )}`
          : formatDistanceToNow(created, { addSuffix: true, locale: ptBR })
      );

      setTimeSinceUpdated(
        updatedDiff >= 3600
          ? `Há ${formatDuration(
              intervalToDuration({ start: updated, end: now }),
              { format: ["hours", "minutes"], locale: ptBR }
            )}`
          : formatDistanceToNow(updated, { addSuffix: true, locale: ptBR })
      );
    };

    updateCounters();

    const interval = setInterval(updateCounters, 55000);

    return () => clearInterval(interval);
  }, [ticket.createdAt, ticket.updatedAt]);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-1 p-1 bg-muted rounded mb-1">
      <Avatar>
        <AvatarImage src={ticket.contact.profilePicUrl} alt="@shadcn" />
        <AvatarFallback>
          <Smile />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="grid grid-cols-[1fr_auto]">
          <p className="text-sm font-medium truncate">{ticket.contact.name}</p>
          <span className="rounded-full text-white bg-primary px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
            {timeSinceCreated}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              Atendente:
            </p>
            {ticket.user && (
              <span className="text-xs font-semibold whitespace-nowrap">
                {ticket.user.name}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              Última interação:
            </p>
            <p className="text-xs font-semibold whitespace-nowrap">
              {timeSinceUpdated}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
