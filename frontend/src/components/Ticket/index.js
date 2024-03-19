import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import { Avatar, Box, Stack, Typography, useTheme } from "@mui/material";

import MessageInput from "../MessageInput/";

import Chip from "@mui/material/Chip";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactDrawer from "../ContactDrawer";
import MessagesList from "../MessagesList";
import TicketActionButtons from "../TicketActionButtons";

const Ticket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/" + ticketId);
          setContact(data.contact);
          setTicket(data);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, navigate]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("ticket", (data) => {
      if (data.action === "update") {
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast.success("Ticket deleted sucessfully.", {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
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

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <ReplyMessageProvider>
      <Box>
        {/* Header */}
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          width={"100%"}
          
          p={0.5}
          sx={{
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack direction={"row"} spacing={2} px={2}>
            <Stack
              onClick={handleDrawerOpen}
              sx={{ cursor: "pointer" }}
              direction={"row"}
              alignItems={"center"}
            >
              <Avatar
                sx={{ width: 56, height: 56 }}
                src={contact.profilePicUrl}
                alt="contact_image"
              />
            </Stack>
            <Stack direction={"column"} justifyContent={"center"}>
              <Typography variant="subtitle1">{contact.name}</Typography>

              {ticket.user?.name && (
                <Typography variant="caption" color={"gray"}>
                  Atribuído a: {ticket.user?.name}
                </Typography>
              )}
              <Stack direction={"row"} spacing={1} flexWrap={"wrap"}>
                {loading
                  ? null
                  : contact.tagslist?.map((e, i) => {
                      return (
                        <Box key={i} sx={{marginBottom: 10}} >
                          <Chip
                            label={e.name}
                            
                            sx={{
                              height: 20,
                              background: ` ${
                                e.typetag === "user"
                                  ? theme.palette.primary.main
                                  : e.typetag === "enterprise"
                                  ? "#193044"
                                  : e.typetag === "custom"
                                  ? "#F0F4F8"
                                  : "#F0F4F8"
                              }`,
                              color: ` ${
                                e.typetag === "user"
                                  ? "#fff"
                                  : e.typetag === "enterprise"
                                  ? "#fff"
                                  : "#444"
                              }`,
                            }}
                          />
                        </Box>
                      );
                    })}
              </Stack>
            </Stack>
          </Stack>
          <TicketActionButtons ticket={ticket} />
        </Stack>
        {/* Mensagens */}

        {/*  <MessagesList ticketId={ticketId} isGroup={ticket.isGroup} />  */}

        {/* Footer */}
        <MessageInput ticketStatus={ticket.status} /> 

        <ContactDrawer
          open={drawerOpen}
          handleDrawerClose={handleDrawerClose}
          contact={contact}
          loading={loading}
        />
      </Box>
    </ReplyMessageProvider>
  );
};

export default Ticket;
