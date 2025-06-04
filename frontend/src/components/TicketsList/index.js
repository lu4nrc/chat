import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "../../services/socket-io";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Import TanStack Query

import { AuthContext } from "../../context/Auth/AuthContext";
// import useTickets from "../../hooks/useTickets"; // Remove useTickets
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";
import InfiniteScroll from "../ui/InfiniteScroll";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// const reducer = (state, action) => { ... }; // Reducer is no longer needed

const TicketsList = (props) => {
  const {
    status,
    searchParam,
    showAll,
    selectedQueueIds,
    updateCount,
    activeTab,
    filter,
    setFilter,
    allConnected,
    sethasMoreManage
  } = props;

  // const [pageNumber, setPageNumber] = useState(1); // Replaced by useInfiniteQuery's pageParam
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // useEffect(() => { // This useEffect for RESET will be removed
  //   dispatch({ type: "RESET" });
  //   // setPageNumber(1); // No longer needed
  // }, [status, searchParam, dispatch, showAll, selectedQueueIds]);

  const fetchTickets = async ({ pageParam = 1 }) => {
    const params = {
      searchParam,
      pageNumber: pageParam,
      status,
      showAll,
      queueIds: JSON.stringify(selectedQueueIds),
      // date: undefined, // As per plan, if needed, source them
      // withUnreadMessages: undefined, // As per plan
    };
    const { data } = await api.get("/tickets", { params });
    // API returns { tickets: [], count: number, hasMore: boolean }
    return { tickets: data.tickets, hasMore: data.hasMore, nextPageParam: pageParam + 1, count: data.count };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading, // Initial load
    isFetchingNextPage, // Subsequent page loads
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['tickets', { status, searchParam, showAll, queueIds: selectedQueueIds }], // selectedQueueIds in key directly
    queryFn: fetchTickets,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPageParam : undefined;
    },
    enabled: !!status, // Only fetch if status is active
  });

  const ticketsDataFromQuery = data?.pages?.flatMap(page => page.tickets) ?? [];

  // sethasMoreManage(hasNextPage); // Propagate hasNextPage

  // useEffect(() => { // This useEffect for LOAD_TICKETS will be removed
  //   if (!status && !searchParam && !showAll) return; // Conditions might need adjustment
  //   // Data from useInfiniteQuery is now the source, this dispatch might be redundant
  //   // or needs to be re-evaluated once socket logic is also moved to react-query
  //   // For now, to keep the existing reducer logic somewhat functional with sockets:
  //   dispatch({
  //     type: "LOAD_TICKETS", // This action might need to be smarter or removed
  //     payload: ticketsDataFromQuery,
  //   });
  // }, [ticketsDataFromQuery, status, searchParam, showAll]); // Depends on ticketsDataFromQuery

  useEffect(() => {
    if (hasNextPage !== undefined) { // Check if hasNextPage is defined before calling
        sethasMoreManage(hasNextPage);
    }
  }, [hasNextPage, sethasMoreManage]);


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

    // Define queryKey for setQueryData, using current props/state
    const currentQueryKey = ['tickets', { status, searchParam, showAll, queueIds: selectedQueueIds }];

    socket.on("ticket", (socketTicketData) => {
      if (socketTicketData.action === "updateUnread") {
        queryClient.setQueryData(currentQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              tickets: page.tickets.map(ticket =>
                ticket.id === socketTicketData.ticketId ? { ...ticket, unreadMessages: 0 } : ticket
              ),
            })),
          };
        });
      }

      if (socketTicketData.action === "update") {
        if (shouldUpdateTicket(socketTicketData.ticket)) {
          queryClient.setQueryData(currentQueryKey, (oldData) => {
            if (!oldData) return oldData;
            let ticketFoundAndUpdated = false;
            const newPages = oldData.pages.map(page => ({
              ...page,
              tickets: page.tickets.map(ticket => {
                if (ticket.id === socketTicketData.ticket.id) {
                  ticketFoundAndUpdated = true;
                  return socketTicketData.ticket;
                }
                return ticket;
              }),
            }));
            // If ticket not found, add to the beginning of the first page
            if (!ticketFoundAndUpdated && newPages.length > 0) {
              newPages[0].tickets.unshift(socketTicketData.ticket);
            } else if (!ticketFoundAndUpdated && newPages.length === 0) {
              // If no pages exist yet (e.g. empty list), create a new page
              // This case might be less common if initial fetch already ran
              newPages.push({ tickets: [socketTicketData.ticket], hasMore: false, nextPageParam: 2, count: 1});
            }
            return { ...oldData, pages: newPages };
          });
        } else if (notBelongsToUserQueues(socketTicketData.ticket)) {
          // Remove ticket if it no longer belongs to user queues
          queryClient.setQueryData(currentQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map(page => ({
                ...page,
                tickets: page.tickets.filter(ticket => ticket.id !== socketTicketData.ticket.id),
              })),
            };
          });
        }
      }

      if (socketTicketData.action === "delete") {
        queryClient.setQueryData(currentQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              tickets: page.tickets.filter(ticket => ticket.id !== socketTicketData.ticketId),
            })),
          };
        });
      }
    });

    socket.on("appMessage", (appMessageData) => {
      if (appMessageData.action === "create" && shouldUpdateTicket(appMessageData.ticket)) {
        queryClient.setQueryData(currentQueryKey, (oldData) => {
          if (!oldData) return oldData;
          let ticketFound = false;
          const newPages = oldData.pages.map(page => ({
            ...page,
            tickets: page.tickets.map(ticket => {
              if (ticket.id === appMessageData.ticket.id) {
                ticketFound = true;
                return appMessageData.ticket; // Update existing ticket
              }
              return ticket;
            }),
          }));

          if (!ticketFound && newPages.length > 0) {
            // Add to top of first page and ensure it's sorted if needed (or rely on query resort)
            const newFirstPageTickets = [appMessageData.ticket, ...newPages[0].tickets];
            newPages[0] = { ...newPages[0], tickets: newFirstPageTickets };
          } else if (!ticketFound && newPages.length === 0) {
             newPages.push({ tickets: [appMessageData.ticket], hasMore: false, nextPageParam: 2, count: 1});
          }
          // Optionally, re-sort or move the updated/new ticket to the top of the list across all pages
          // For simplicity here, just adding/updating in place or at start of first page.
          return { ...oldData, pages: newPages };
        });
      }
    });

    socket.on("contact", (contactData) => {
      if (contactData.action === "update") {
        queryClient.setQueryData(currentQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              tickets: page.tickets.map(ticket =>
                ticket.contactId === contactData.contact.id || (ticket.contact && ticket.contact.id === contactData.contact.id)
                  ? { ...ticket, contact: contactData.contact }
                  : ticket
              ),
            })),
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [status, searchParam, showAll, user, selectedQueueIds, queryClient, filter]); // Added queryClient and filter

  useEffect(() => {
    if (typeof updateCount === "function") {
      // Use count from the first page if available (total count for the query)
      // or the length of currently loaded tickets if total count isn't consistently provided per page.
      const totalCount = data?.pages?.[0]?.count;
      if (typeof totalCount === 'number') {
        updateCount(totalCount);
      } else {
        updateCount(ticketsDataFromQuery.length);
      }
    }
  }, [data, ticketsDataFromQuery, updateCount]);


  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Apply local filter to the data fetched by useInfiniteQuery
  const mensagensFiltradas = ticketsDataFromQuery.filter((mensagem) => {
    if (!filter) {
      return true; // Retorna true para manter todas as mensagens
    }
    return mensagem.contact.name.toLowerCase().includes(filter.toLowerCase());
  });

  if (activeTab !== status) return null;
  return (
    <div
      className={cn(
        "overflow-auto ",
        allConnected ? "h-[calc(100vh-137px)]" : "h-[calc(100vh-255px)]"
      )}
    >
      {isLoading && mensagensFiltradas.length === 0 ? ( // Show skeleton or loader on initial load
        <TicketsListSkeleton /> // Or a simpler Loader2 if preferred for initial
      ) : mensagensFiltradas.length === 0 && !isLoading && !isFetchingNextPage ? (
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
      <InfiniteScroll
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage} // Use isFetchingNextPage for pagination loading
        next={loadMore}
        threshold={0.5}
      >
        {hasNextPage && isFetchingNextPage && ( // Show loader only when actively fetching more
          <div className="flex justify-center items-center ">
            <Loader2 className=" h-8 w-8 text-primary animate-spin" />
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default TicketsList;
