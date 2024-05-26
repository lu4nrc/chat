import { format, isSameDay, parseISO } from "date-fns";
import React, { useEffect, useReducer, useRef, useState } from "react";
import openSocket from "../../services/socket-io";

import { AccessTime, Block, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import {
  CaretDown,
  Check,
  Checks,
  ClockCountdown,
  Download,
  Trash,
} from "@phosphor-icons/react";
import { Divider } from "rsuite";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import LocationPreview from "../LocationPreview";
import MarkdownWrapper from "../MarkdownWrapper";
import MessageOptionsMenu from "../MessageOptionsMenu";
import ModalImageCors from "../ModalImageCors";
import VcardPreview from "../VcardPreview";
import AudioComp from "../AudioComp";

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticketId, isGroup }) => {
  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  /* ADD */
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);
  /*  */

  const [, setTicket] = useState({});
  const stackRef = useRef(null);
  const previousScrollHeightRef = useRef(0);

  useEffect(() => {
    restoreScrollPosition();
  }, [messagesList]);

  const restoreScrollPosition = () => {
    if (stackRef.current) {
      const scrollDifference =
        stackRef.current.scrollHeight - previousScrollHeightRef.current;
      stackRef.current.scrollTop += scrollDifference;
    }
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            previousScrollHeightRef.current = stackRef.current.scrollHeight;
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }

          setTicket(data.ticket);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("appMessage", (data) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (loading) return;

    if (scrollTop < 10) {
      console.log("scrollTop");
      setLoading(true);
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message) => {
    if (
      message.mediaType === "location" &&
      message.body.split("|").length >= 2
    ) {
      let locationParts = message.body.split("|");
      let imageLocation = locationParts[0];
      let linkLocation = locationParts[1];

      let descriptionLocation = null;

      if (locationParts.length > 2)
        descriptionLocation = message.body.split("|")[2];

      return (
        <LocationPreview
          image={imageLocation}
          link={linkLocation}
          description={descriptionLocation}
        />
      );
    } else if (message.mediaType === "vcard") {
      let array = message.body.split("\n");
      let obj = [];
      let contact = "";
      for (let index = 0; index < array.length; index++) {
        const v = array[index];
        let values = v.split(":");
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf("+") !== -1) {
            obj.push({ number: values[ind] });
          }
          if (values[ind].indexOf("FN") !== -1) {
            contact = values[ind + 1];
          }
        }
      }
      return <VcardPreview contact={contact} numbers={obj[0].number} />;
    } else if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") {
      return (
        <AudioComp audio={message.mediaUrl} />
      );
    } else if (message.mediaType === "video") {
      return (
        <div style={{ width: "200px", maxWidth: "100%" }}>
          <video
            style={{ width: "100%", height: "auto", borderRadius: "5px" }}
            src={message.mediaUrl}
            controls
          />
        </div>
      );
    } else {
      return (
        <div style={{padding: "5px"}}>
          <Button
            variant="contained"
            startIcon={<Download size={24} />}
            target="_blank"
            href={message.mediaUrl}
            fullWidth
          >
            Fazer Download
          </Button>
        </div>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <ClockCountdown fontSize="small" />;
    }
    if (message.ack === 1) {
      return <Check size={18} color="grey" />;
    }
    if (message.ack === 2) {
      return <Checks size={18} color="grey" />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return <Checks size={18} color="#00a86b" />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <div key={`timestamp-${message.id}`}>
          <span style={{ fontSize: "12px"}}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </span>
        </div>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <div key={`timestamp-${message.id}`}>
            <span style={{ fontSize: 14 }}>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </span>
          </div>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <Box
        display={"flex"}
        flexDirection={"column"}
        px={message.quotedMsg.mediaType === "chat" ? 1 : ""}
        py={message.quotedMsg.mediaType === "chat" ? 0.5 : ""}
        borderLeft={
          message.quotedMsg.mediaType === "chat" ? "4px solid #FF2661" : ""
        }
        bgcolor={
          message.fromMe
            ? theme.palette.background.neutral
            : theme.palette.background.default
        }
        borderRadius={0.5}
      >
        {!message.quotedMsg?.fromMe && (
          <p style={{fontSize: "12px", fontWeight: 600}}>
            <MarkdownWrapper>
              {message.quotedMsg?.contact?.name}
            </MarkdownWrapper>
          </p>
        )}

        {message.quotedMsg.mediaType === "image" ? (
          <ModalImageCors imageUrl={message.quotedMsg.mediaUrl} />
        ) : message.quotedMsg.mediaType === "audio" ? (
          /*           <audio controls>
            <source src={message.quotedMsg.mediaUrl} type="audio/ogg" />
          </audio> */
          <AudioComp audio={message.quotedMsg.mediaUrl} />
        ) : message.quotedMsg.mediaType === "video" ? (
          <video src={message.quotedMsg.mediaUrl} controls />
        ) : (
          <p
            style={{
              whiteSpace: "pre-wrap",
              paddingLeft: 1,
              paddingRight: 2,
            }}
          >
            <MarkdownWrapper>{message.quotedMsg?.body}</MarkdownWrapper>
          </p>
        )}
      </Box>
    );
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      if (pageNumber === 1) {
        lastMessageRef.current.scrollIntoView({ behaviour: "smooth" });
      }
    }
  }, [messagesList, pageNumber]);

  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        console.log(message)
        if (message.mediaType === null) {
          return (
            <div
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                paddingY: 1,
              }}
              key={message.id}
            >
              <div
                style={{
                  padding: "5px 10px 5px 10px",
                  borderRadius: "5px",
                  border: `1px solid ${theme.palette.background.paper}`,
                  backgroundColor: theme.palette.background.neutral,
                  margin: "3px"
                }}
              >
                <span
                  style={{
                    color: theme.palette.info.main,
                    fontSize: "12px",
                  }}
                >
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                </span>
              </div>
            </div>
          );
        } else
          return (
            <Box
              sx={{ opacity: message.isDeleted ? 0.5 : 1 }}
              pb={0.7}
              key={message.id}
              display={"flex"}
              flexDirection={"column"}
              alignItems={!message.fromMe ? "start" : "end"}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ color: theme.palette.primary.main, fontWeight: 700 }}
                >
                  {renderDailyTimestamps(message, index)}
                </span>
              </div>

              {/* {renderMessageDivider(message, index)} */}

              <Stack
                key={message.id}
                alignItems={"start"}
                justifyContent={"center"}
                bgcolor={
                  !message.fromMe ? theme.palette.background.neutral : ""
                }
                sx={{
                  borderRadius: message.fromMe
                    ? "11px 11px 0px 11px"
                    : "11px 11px 11px 0px", // superior esquerdo, superior direito, inferior direito, inferior esquerdo
                }}
                border={1}
                padding={message.mediaType === "chat" ? 0.7 : 0}
                borderColor={theme.palette.background.paper}
                direction={"column"}
                position={"relative"}
                width={"fit-content"}
                maxWidth={{ xs: "100%", md: "512px" }}
                minHeight={40}
                overflow={"hidden"}
              >
                {isGroup && (
                  <p
                    style={{
                      color: theme.palette.primary.main,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {message.contact?.name}
                  </p>
                )}
                {(message.mediaUrl ||
                  message.mediaType === "location" ||
                  message.mediaType === "vcard") &&
                  checkMessageMedia(message)}

                {message.isDeleted && (
                  <div
                    style={{
                      fontStyle: "italic",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Trash fontSize="small" /> <span>Mensagem apagada</span>
                  </div>
                )}
                {message.quotedMsg && renderQuotedMessage(message)}

                {message.mediaType === "audio" ||
                (message.mediaType === "image" && (message.body.trim().endsWith('.jpeg') || message.body.trim().endsWith('.webp'))) ? null : (
                  
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingLeft: 1,
                      paddingRight: 2,
                    }}
                  >

                    <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  </p>
                )}
                {!message.isDeleted && (
                  <div
                    onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      backgroundColor: "rgba(240, 240, 240, 0.5)",
                      borderRadius: "0px 11px 0px 11px",
                      display: "flex",
                      padding: "2px",
                    }}
                  >
                    <CaretDown id="messageActionsButton" />
                  </div>
                )}
              </Stack>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  // sx={{ position: "absolute", right: 5, bottom: 1 }}

                  style={{ color: "grey", fontSize: "12px" }}
                >
                  {format(parseISO(message.createdAt), "HH:mm")}
                </span>
                {message.fromMe && renderMessageAck(message)}
              </div>
            </Box>
          );
      });
      return viewMessagesList;
    } else {
      return <div>Diga olá ao seu novo contato!</div>;
    }
  };
  const theme = useTheme();
  return (
    <>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />

      <Stack
        p={0.5}
        height={"100%"}
        direction="column"
        width={"100%"}
        overflow={"auto"}
        position={"relative"}
        onScroll={handleScroll}
        ref={stackRef}
      >
        {messagesList.length > 0 ? renderMessages() : []}
        {loading && (
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress />
          </div>
        )}
      </Stack>
    </>
  );
};

export default MessagesList;
