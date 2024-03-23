import React, { useContext, useRef, useState } from "react";

import { format, isSameDay, parseISO } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import MarkdownWrapper from "../MarkdownWrapper";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";

import {
  Avatar,
  Badge,
  Box,
  Card,
  CardHeader,
  Popover,
  Stack,
  Tooltip,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import { Clock } from "@phosphor-icons/react";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

export const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#fff",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid #44b700",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(1.7)",
      opacity: 0,
    },
  },
}));

const TicketListItem = ({ ticket, setFilter }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const openPoppover = false;

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      var ticketUpdated = await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
      setCurrentTicket(ticketUpdated.data);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate(`/tickets/${id}`);
  };

  const spyMessages = (id) => {
    navigate(`/tickets/${id}`);
  };

  const handleSelectTicket = (id) => {
    setFilter("");
    navigate(`/tickets/${id}`);
  };
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  function DiffInHours(date1, date2) {
    const diffInMs =
      (date2 === null ? new Date().getTime() : new Date(date2).getTime()) -
      (date1 === null ? new Date().getTime() : new Date(date1).getTime());
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60)) % 60;

    const diffTime = new Date(1970, 0, 1, diffInHours, diffInMinutes, 0);

    return diffTime.toLocaleTimeString("pt-BR", { timeStyle: "short" });
  }
  const open = Boolean(anchorEl);
  const id = openPoppover ? "simple-popover" : undefined;

  return (
    <React.Fragment key={currentTicket.id}>
      <Stack
        alignItems={"center"}
        borderRadius={1}
        direction={"row"}
        px={1}
        py={0.5}
        marginBottom={0.3}
        bgcolor={theme.palette.background.neutral}
        onClick={(e) => {
          if (currentTicket.status === "pending") spyMessages(ticket.id);
          handleSelectTicket(ticket.id);
        }}
        selected={ticketId && +ticketId === currentTicket.id}
      >
        <Tooltip
          arrow
          placement="right"
          title={`${currentTicket?.queue?.name ?? "Sem fila"} | ${
            currentTicket?.whatsappId
              ? currentTicket?.whatsapp?.name ?? "Sem conexão"
              : "Sem conexão"
          }`}
        >
          {ticket.unreadMessages ? (
            <StyledBadge
              badgeContent={ticket.unreadMessages}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Avatar
                src={currentTicket?.contact?.profilePicUrl}
                style={{
                  border: `3px solid${currentTicket.queue?.color || "#7C7C7C"}`,
                  height: 50,
                  width: 50,
                }}
              />
            </StyledBadge>
          ) : (
            <Avatar
              src={currentTicket?.contact?.profilePicUrl}
              style={{
                border: `3px solid${currentTicket?.queue?.color || "#7C7C7C"}`,
                height: 50,
                width: 50,
              }}
            />
          )}
        </Tooltip>

        {/* ========================= */}

        <Stack
          marginLeft={2}
          flexDirection={"row"}
          justifyContent={"space-between"}
          width={"100%"}
          overflow={"hidden"}
          textOverflow={"ellipsis"}
        >
          <Stack width={"100%"}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Typography noWrap overflow={"hidden"} variant="body2">
                {currentTicket.contact.name}
              </Typography>
              {ticket.lastMessage && (
                <Box>
                  {isSameDay(parseISO(currentTicket.updatedAt), new Date()) ? (
                    <Typography variant="body2">
                      {format(parseISO(currentTicket.updatedAt), "HH:mm")}
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      {format(parseISO(currentTicket.updatedAt), "dd/MM/yyyy")}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Typography
                noWrap
                overflow={"hidden"}
                variant="body2"
                color="textSecondary"
                maxHeight={"20px"}
              >
                <MarkdownWrapper>
                  {currentTicket.lastMessage ? `${ticket.lastMessage}` : ""}
                </MarkdownWrapper>
              </Typography>
              <Stack alignItems={"end"}>
                {/*           {ticket.status === "closed" && (
            <Stack>
              <Typography variant="body2" color="grey">
                {currentTicket.userId ? "Encerrado" : "Notificação"}
              </Typography>
            </Stack>
          )} */}

                <Stack>
                  <Clock
                    aria-describedby={id}
                    onClick={handleClick}
                    color={"#7C7C7C"}
                    size={24}
                  />

                  <Popover
                    id={id}
                    elevation={0}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  >
                    <Stack p={1}>
                      {currentTicket.status === "pending" ? (
                        <>
                          <Typography variant="span">
                            Tempo de espera:{" "}
                            {open
                              ? DiffInHours(currentTicket.initialDate, null)
                              : null}
                          </Typography>
                        </>
                      ) : null}
                      {currentTicket.status === "open" ? (
                        <>
                          <Typography variant="span">
                            Tempo de espera:{" "}
                            {open
                              ? DiffInHours(
                                  currentTicket.initialDate,
                                  currentTicket.acceptDate
                                )
                              : null}
                          </Typography>
                          <Typography variant="span">
                            Tempo de atendimento:{" "}
                            {open
                              ? DiffInHours(currentTicket.acceptDate, null)
                              : null}
                          </Typography>
                        </>
                      ) : null}

                      {currentTicket.status === "closed" ? (
                        <>
                          <Typography variant="body2">
                            Tempo de espera:{" "}
                            {open
                              ? DiffInHours(
                                  currentTicket.initialDate,
                                  currentTicket.acceptDate
                                )
                              : null}
                          </Typography>
                          <Typography variant="body2">
                            Tempo de atendimento:{" "}
                            {open
                              ? DiffInHours(
                                  currentTicket.acceptDate,
                                  currentTicket.finishDate
                                )
                              : null}
                          </Typography>
                          <Typography variant="body2">
                            Tempo de total:{" "}
                            {open
                              ? DiffInHours(
                                  currentTicket.initialDate,
                                  currentTicket.finishDate
                                )
                              : null}
                          </Typography>
                        </>
                      ) : null}
                    </Stack>
                  </Popover>
                </Stack>
              </Stack>
            </Box>

            {currentTicket.status === "pending" && (
              <ButtonWithSpinner
                variant="contained"
                size="small"
                loading={loading}
                onClick={(_) => handleAcepptTicket(currentTicket.id)}
              >
                Aceitar atendimento
              </ButtonWithSpinner>
            )}
          </Stack>
        </Stack>
      </Stack>
    </React.Fragment>
  );
};

export default TicketListItem;
