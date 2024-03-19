import { Box, Divider, Stack, Typography, useTheme } from "@mui/material";
import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import Clock from "react-live-clock";
import useTickets from "../../hooks/useTickets";
import openSocket from "../../services/socket-io";
import { AuthContext } from "../../context/Auth/AuthContext";
import PanelListItem from "../PanelListItem";
import toastError from "../../errors/toastError";
import api from "../../services/api";
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

const NewPainel = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [statuses] = useState(["pending", "open"]);
  const [status] = useState("pending");
  const [searchParam] = useState("");
  const [showAll] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [ticketsList, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const [, setTimePassedPending] = useState({
    green: 0,
    orange: 0,
    red: 0,
  });

  const userQueueIds = useMemo(() => {
    return user?.queues ? user.queues.map((q) => q.id) : [];
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setUsers(data.users);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 10000);
    const firtRequest = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setUsers(data.users);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);

    return () => {
      clearTimeout(firtRequest);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [statuses, searchParam, dispatch, showAll, userQueueIds]);

  const { tickets } = useTickets({
    pageNumber,
    searchParam,
    statuses,
    showAll,
    queueIds: JSON.stringify(userQueueIds),
  });

  useEffect(() => {
    if (!statuses && !searchParam) return;
    dispatch({
      type: "LOAD_TICKETS",
      payload: tickets,
    });
  }, [tickets, statuses, searchParam]);

  useEffect(() => {
    const socket = openSocket();

    const shouldUpdateTicket = (ticket) =>
      (!ticket.userId || ticket.userId === user?.id || showAll) &&
      (!ticket.queueId || userQueueIds.indexOf(ticket.queueId) > -1);

    const notBelongsToUserQueues = (ticket) =>
      ticket.queueId && userQueueIds.indexOf(ticket.queueId) === -1;

    /*         socket.on("connect", () => {
      if (statuses) {
        socket.emit("joinTickets", statuses);
      } else {
        socket.emit("joinNotification");
      }
    }); */

    socket.on("connect", () => {
      statuses.forEach((status) => {
        if (status) {
          socket.emit("joinTickets", status);
        }
      });
      if (!statuses.length) {
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
  }, [status, showAll, user, userQueueIds, statuses]);

  /*     useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(ticketsList.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsList]); */

  /* ===================== Atendentes */
  const userQtd = ticketsList.map(
    (el) => el.user?.name || "Nome não disponível"
  );
  const countOccurrences = (arr) => {
    const countObj = {};
    arr.forEach((name) => {
      countObj[name] = (countObj[name] || 0) + 1;
    });

    return Object.keys(countObj).map((name) => ({
      name: name,
      quantidade: countObj[name],
    }));
  };
  const resultUsers = countOccurrences(userQtd).sort(
    (a, b) => b.quantidade - a.quantidade
  );

  /* ===================== Departamento */
  const DepQtd = ticketsList.map((el) => el.queue?.name || "Sem departamento");

  const countOccurrencesDep = (arr) => {
    const countObj = {};
    arr.forEach((name) => {
      countObj[name] = (countObj[name] || 0) + 1;
    });

    return Object.keys(countObj).map((name) => ({
      name: name,
      quantidade: countObj[name],
    }));
  };
  const resultDep = countOccurrencesDep(DepQtd).sort(
    (a, b) => b.quantidade - a.quantidade
  );
  /* ===================== Departamento */

  const listOpen = ticketsList
    .filter((item) => item.status === "open")
    .sort((a, b) => new Date(a.acceptDate) - new Date(b.acceptDate));

  const listPending = ticketsList
    .filter((item) => item.status === "pending")
    .sort((a, b) => new Date(a.acceptDate) - new Date(b.acceptDate));

  return (
    <Stack
      bgcolor={theme.palette.background.default}
      height={"100vh"}
      p={2}
      spacing={2}
    >
      {/* Header */}
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography variant="h5">Acompanhamento</Typography>
        <Typography variant="h5" color={"gray"}>
          <Clock format="HH:mm:ss" interval={1000} ticking={true} />
        </Typography>
      </Stack>

      <Stack
        spacing={1}
        height={"calc(100% - 40px)"}
        width={"100%"}
        sx={{ overflow: "auto" }}
        direction={"row"}
        justifyContent={"space-between"}
      >
        {/* Column 1 */}
        <Stack
          bgcolor={theme.palette.background.paper}
          direction={"column"}
          width={"100%"}
          borderRadius={1}
          overflow={"hidden"}
          border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          sx={{
            boxShadow: (theme) => theme.shadows[2],
            flex: 3,
          }}
        >
          <Stack direction={"row"} p={1} justifyContent={"space-between"}>
            <Typography variant="h6">Pendentes</Typography>
            <Typography
              color={(theme) => theme.palette.primary.main}
              variant="h6"
            >
              {listPending.length}
            </Typography>
            <Stack direction={"row"} spacing={0.5}>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.neutral,
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: 2,
                }}
              >
                <Typography color={"green"} fontWeight={"bold"}>
                  {/* {amounTimePassed.pending.lessthanten} */}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.neutral,
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: 2,
                }}
              >
                <Typography color={"orange"} fontWeight={"bold"}>
                  {/* {amounTimePassed.pending.lessthantwenty} */}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.neutral,
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: 2,
                }}
              >
                <Typography color={"red"} fontWeight={"bold"}>
                  {/*  {amounTimePassed.pending.greaterthanthirty} */}
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: "dashed", marginBottom: 1 }} />
          <Stack
            direction={"column"}
            px={0.8}
            width={"100%"}
            height={"100%"}
            spacing={1}
            sx={{ overflow: "auto" }}
          >
            {listPending.map((el) => {
              return el.status === "pending" ? (
                <PanelListItem
                  key={el.id}
                  setTimePassed={setTimePassedPending}
                  ticket={el}
                />
              ) : null;
            })}
          </Stack>
        </Stack>
        {/* Column 2 */}
        <Stack
          bgcolor={theme.palette.background.paper}
          direction={"column"}
          width={"100%"}
          height={"100%"}
          borderRadius={1}
          overflow={"hidden"}
          border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          sx={{
            boxShadow: (theme) => theme.shadows[3],
            flex: 3,
          }}
        >
          <Stack direction={"row"} p={1} justifyContent={"space-between"}>
            <Typography variant="h6">Em atendimento</Typography>
            <Typography
              color={(theme) => theme.palette.primary.main}
              variant="h6"
            >
              {listOpen.length}
            </Typography>
            <Stack direction={"row"} spacing={0.5}>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.neutral,
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: 2,
                }}
              >
                <Typography color={"green"} fontWeight={"bold"}>
                  {/* {amounTimePassed.open.lessthanten} */}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.neutral,
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: 2,
                }}
              >
                <Typography color={"orange"} fontWeight={"bold"}>
                  {/* {amounTimePassed.open.lessthantwenty} */}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.neutral,
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: 2,
                }}
              >
                <Typography color={"red"} fontWeight={"bold"}>
                  {/* {amounTimePassed.open.greaterthanthirty} */}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: "dashed", marginBottom: 1 }} />
          <Stack
            direction={"column"}
            px={0.8}
            width={"100%"}
            height={"calc(100% - 80px)"}
            spacing={1}
            sx={{ overflow: "auto" }}
          >
            {listOpen.map((el) => {
              return el.status === "open" ? (
                <PanelListItem key={el.id} ticket={el} />
              ) : null;
            })}
          </Stack>
        </Stack>
        {/* Column 4*/}
        <Stack
          bgcolor={theme.palette.background.paper}
          direction={"column"}
          width={"100%"}
          borderRadius={1}
          overflow={"hidden"}
          border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          sx={{
            boxShadow: (theme) => theme.shadows[3],
            flex: 2,
          }}
        >
          <Stack direction={"row"} p={1} justifyContent={"space-between"}>
            <Typography variant="h6">Departamentos</Typography>
            <Typography
              color={(theme) => theme.palette.primary.main}
              variant="h6"
            >
              {resultDep.length}
            </Typography>
          </Stack>

          <Divider sx={{ borderStyle: "dashed", marginBottom: 1 }} />
          <Stack direction={"column"} spacing={0.5} px={1}>
            {resultDep.map((el, index) => (
              <Stack
                key={index}
                py={1.2}
                px={1}
                direction={"row"}
                justifyContent={"space-between"}
                spacing={2}
                alignItems={"center"}
                bgcolor={theme.palette.background.neutral}
                borderRadius={1}
                flexWrap={"wrap"}
                sx={
                  {
                    /* boxShadow: (theme) => theme.shadows[1], */
                    /* border: "1px solid #DFE3E8", */
                  }
                }
              >
                <Typography
                  component="span"
                  variant="body1"
                  fontWeight={"bold"}
                  color="textPrimary"
                  noWrap
                  sx={{
                    maxWidth: 190,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                  }}
                >
                  {el?.name}
                </Typography>
                <Typography fontWeight={"bold"}>{el?.quantidade}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* Column 3 */}
        <Stack
          bgcolor={theme.palette.background.paper}
          direction={"column"}
          width={"100%"}
          height={"100%"}
          borderRadius={1}
          overflow={"hidden"}
          border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          sx={{
            boxShadow: (theme) => theme.shadows[3],
            flex: 2,
          }}
        >
          <Stack direction={"row"} p={1} justifyContent={"space-between"}>
            <Typography variant="h6">Atendentes</Typography>

            <Typography
              color={(theme) => theme.palette.primary.main}
              variant="h6"
            >
              {resultUsers.length}
            </Typography>
          </Stack>
          <Divider sx={{ borderStyle: "dashed", marginBottom: 1 }} />
          <Stack direction={"column"} spacing={0.5} px={1}>
            {resultUsers.map((el, index) => (
              <Stack
                key={index}
                py={1.2}
                px={1}
                direction={"row"}
                justifyContent={"space-between"}
                spacing={2}
                alignItems={"center"}
                bgcolor={theme.palette.background.neutral}
                borderRadius={1}
                flexWrap={"wrap"}
                sx={
                  {
                    /* boxShadow: (theme) => theme.shadows[1], */
                    /* border: "1px solid #DFE3E8", */
                  }
                }
              >
                <Stack>
                  <Typography
                    component="span"
                    variant="body1"
                    fontWeight={"bold"}
                    color="textPrimary"
                    noWrap
                    sx={{
                      maxWidth: 190,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "inline-block",
                    }}
                  >
                    {el?.name}
                  </Typography>
                  {users
                    .filter((user) => user.name === el?.name)
                    .map((filteredUser) =>
                      filteredUser.status === "active" ? (
                        <Typography
                          key={filteredUser.id}
                          variant="caption"
                          color={"green"}
                          sx={{ lineHeight: 1 }}
                        >
                          online
                        </Typography>
                      ) : filteredUser.status === "lazy" ? (
                        <Typography
                          key={filteredUser.id}
                          variant="caption"
                          color={"orange"}
                          sx={{ lineHeight: 1 }}
                        >
                          Indisponível
                        </Typography>
                      ) : (
                        <Typography
                          key={filteredUser.id}
                          variant="caption"
                          color={"red"}
                          sx={{ lineHeight: 1 }}
                        >
                          Offline
                        </Typography>
                      )
                    )}
                </Stack>
                <Typography fontWeight={"bold"}>{el?.quantidade}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
        {/* Column 3 */}
      </Stack>
    </Stack>
  );
};

export default NewPainel;
