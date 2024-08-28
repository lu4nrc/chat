import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import MessageInput from "../MessageInput/";

import Chip from "@mui/material/Chip";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactDrawer from "../ContactDrawer";
import MessagesList from "../MessagesList";
import TicketActionButtons from "../TicketActionButtons";
import { ArrowLeft } from "@phosphor-icons/react";

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
    console.log(`clicked`);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <ReplyMessageProvider>
      <div className="grid grid-rows-[auto_1fr_auto] h-screen">
        <Box
          width={"100%"}
          height="fit-content"
          padding={0.5}
          display={"flex"}
          justifyContent={"space-between"}
          flexDirection={"row"}
          alignItems={"center"}
          borderBottom={2}
          borderColor={theme.palette.divider}
        >
          {/* Header */}

          <Stack flexDirection={"row"} gap={1} onClick={handleDrawerOpen}>
            <Stack
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={1}
            >
              <IconButton
                sx={{
                  display: { xs: "inherit", md: "none" },
                  width: "32px",
                  height: "32px",
                }}
                onClick={(e) => console.log()}
              >
                <ArrowLeft size={24} />
              </IconButton>

              <Avatar
                sx={{ width: 56, height: 56, cursor: "pointer" }}
                src={contact.profilePicUrl}
                alt="contact_image"
              />
              <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
              >
                <Typography variant="subtitle1">{contact.name}</Typography>
                {ticket.user?.name && (
                  <Typography variant="caption" color={"gray"}>
                    Atribuído a: {ticket.user?.name}
                  </Typography>
                )}
                <Stack
                  sx={{ cursor: "pointer" }}
                  direction={"row"}
                  spacing={1}
                  flexWrap={"wrap"}
                >
                  {loading
                    ? null
                    : contact.tagslist?.map((e, i) => {
                        return (
                          <Box key={i} sx={{ marginBottom: 10 }}>
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
              </Box>
            </Stack>
          </Stack>

          <TicketActionButtons ticket={ticket} />
        </Box>

        <MessagesList ticketId={ticketId} isGroup={ticket.isGroup} />

        <MessageInput ticketStatus={ticket.status} />

        <ContactDrawer
          open={drawerOpen}
          handleDrawerClose={handleDrawerClose}
          contact={contact}
          loading={loading}
        />
      </div>
    </ReplyMessageProvider>
  );
};

export default Ticket;
