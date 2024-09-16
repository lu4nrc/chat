import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import { AuthContext } from "../../context/Auth/AuthContext";
import useTickets from "../../hooks/useTickets";

const reducer = (state, action) => {
  if (action.type === "LOAD_TICKETS") {
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
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state[ticketIndex].unreadMessages = 0;
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
      state.unshift(state.splice(ticketIndex, 1)[0]);
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact = action.payload;
    const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
    if (ticketIndex !== -1) {
      state[ticketIndex].contact = contact;
    }
    return [...state];
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state.splice(ticketIndex, 1);
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const TicketsList = (props) => {
  const {
    status,
    searchParam,
    showAll,
    selectedQueueIds,
    updateCount,
    activeTab,
    filter,
    setFilter
  } = props;

  const [pageNumber, setPageNumber] = useState(1);
  const [ticketsList, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);


  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [status, searchParam, dispatch, showAll, selectedQueueIds]);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    searchParam,
    status,
    showAll,
    queueIds: JSON.stringify(selectedQueueIds),
  });

  useEffect(() => {
    if (!status && !searchParam) return;
    dispatch({
      type: "LOAD_TICKETS",
      payload: tickets,
    });
  }, [tickets]);

  useEffect(() => {
    const socket = openSocket();

    const shouldUpdateTicket = (ticket) =>
      !searchParam &&
      (!ticket.userId || ticket.userId === user?.id || showAll) &&
      (!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

    const notBelongsToUserQueues = (ticket) =>
      ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

    socket.on("connect", () => {
      if (status) {
        socket.emit("joinTickets", status);
      } else {
        socket.emit("joinNotification");
      }
    });

    socket.on("ticket", (data) => {
      if (data.action === "updateUnread") {
        dispatch({
          type: "RESET_UNREAD",
          payload: data.ticketId,
        });
      }

      if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET",
          payload: data.ticket,
        });
      }

      if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
        dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
      }
    });

    socket.on("appMessage", (data) => {
      if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data.ticket,
        });
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        dispatch({
          type: "UPDATE_TICKET_CONTACT",
          payload: data.contact,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [status, searchParam, showAll, user, selectedQueueIds]);

  useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(ticketsList.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsList]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      e.currentTarget.scrollTop = scrollTop - 100;
      loadMore();
    }
  };

  const mensagensFiltradas = ticketsList.filter((mensagem) => {
    if (!filter) {
      return true; // Retorna true para manter todas as mensagens
    }
    return mensagem.contact.name.toLowerCase().includes(filter.toLowerCase());
  });

  if (activeTab !== status) return null;

  return (
    <div
      className="overflow-auto h-[calc(100vh-145px)]"
      onScroll={handleScroll}
    >
      {mensagensFiltradas.length === 0 && !loading ? (
        <h3 className="text-center p-4">
          Parece que finalizamos todos os atendimentos 😅
          <br />
          <strong>Não há mensagens para mostrar no momento.</strong>
        </h3>
      ) : (
        mensagensFiltradas.map((ticket) => (
          <TicketListItem
            ticket={ticket}
            key={ticket.id}
            setFilter={setFilter}
          />
        ))
      )}
      {loading && <TicketsListSkeleton />}
    </div>
  );
};

export default TicketsList;
