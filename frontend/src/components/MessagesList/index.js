import { format, isSameDay, parseISO } from "date-fns";
import React, { useEffect, useReducer, useRef, useState } from "react";
import openSocket from "../../services/socket-io";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import LocationPreview from "../LocationPreview";
import MarkdownWrapper from "../MarkdownWrapper";
import MessageOptionsMenu from "../MessageOptionsMenu";
import ModalImageCors from "../ModalImageCors";
import VcardPreview from "../VcardPreview";
import AudioComp from "../AudioComp";
import { Button } from "../ui/button";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Download,
  LoaderCircle,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const removerHashDoNomeDoArquivo = (nomeArquivo) => {
    // Encontra a posição dos dois últimos pontos no nome do arquivo
    const lastDotIndex = nomeArquivo.lastIndexOf(".");
    const secondLastDotIndex = nomeArquivo.lastIndexOf(".", lastDotIndex - 1);

    // Extrai a parte antes do segundo ponto e a extensão do arquivo após o último ponto
    const nameWithoutHash =
      nomeArquivo.slice(0, secondLastDotIndex) +
      nomeArquivo.slice(lastDotIndex);

    return nameWithoutHash;
  };

  const baixarArquivoSemHash = async (url, nomeArquivo) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Obtém o nome do arquivo sem a hash
      const nomeArquivoSemHash = removerHashDoNomeDoArquivo(nomeArquivo);

      // Cria um link temporário
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", nomeArquivoSemHash); // Define o atributo 'download' para baixar o arquivo
      // Adiciona um evento de clique para baixar o arquivo quando o botão for clicado
      link.addEventListener(
        "click",
        () => {
          document.body.removeChild(link);
        },
        { once: true }
      );
      // Adiciona o link ao DOM
      document.body.appendChild(link);
      // Simula um clique para iniciar o download
      link.click();
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    }
  };

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
      return <VcardPreview contact={contact} numbers={obj[0]?.number} />;
    } else if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") {
      return <AudioComp audio={message.mediaUrl} />;
    } else if (message.mediaType === "video") {
      return (
        <video
          className="h-auto w-56 rounded-lg"
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      const nomeArquivo = message.mediaUrl.split("/").pop();
      return (
        <Button
          size="icon"
          onClick={() => baixarArquivoSemHash(message.mediaUrl, nomeArquivo)} // Chama a função para baixar o arquivo sem a hash
        >
          <Download className="pr-1" />
        </Button>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <Clock size={18} color="grey" />;
    }
    if (message.ack === 1) {
      return <Check size={18} color="grey" />;
    }
    if (message.ack === 2) {
      return <CheckCheck size={18} color="grey" />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return <CheckCheck size={18} color="#00a86b" />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <div key={`timestamp-${message.id}`}>
          <span style={{ fontSize: "12px" }}>
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

  /*   const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  }; */

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={cn(
          "flex flex-col w-full rounded-lg bg-background mb-2",
          message.quotedMsg.mediaType === "chat"
            ? "px-1 py-2  border-l-4 border-primary"
            : "py-1",
          message.fromMe ? "bg-muted" : "bg-background"
        )}
      >
        {!message.quotedMsg?.fromMe && (
          <p className="text-xs font-normal">
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
          <video
            className="h-auto w-56 rounded-lg"
            src={message.quotedMsg.mediaUrl}
            controls
          />
        ) : (
          <p className="pl-1 pr-2 whitespace-pre-wrap text-[14.2px]">
            <MarkdownWrapper>{message.quotedMsg?.body}</MarkdownWrapper>
          </p>
        )}
      </div>
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
        const file_name = message.mediaUrl
          ? removerHashDoNomeDoArquivo(message.mediaUrl.split("/").pop())
          : null;

        if (message.mediaType === null) {
          return (
            <p
              className={
                "flex w-full justify-center items-center bg-muted border rounded-lg px-2 py-1 text-chart1 text-sm"
              }
              key={message.id}
            >
              <MarkdownWrapper>{message.body}</MarkdownWrapper>
            </p>
          );
        } else
          return (
            <div
              className={cn(
                "flex flex-col",
                message.isDeleted ? "opacity-50" : "opacity-100",
                !message.fromMe ? "items-start" : "items-end"
              )}
              key={message.id}
            >
              {/* Horario do dia */}
              <span className="text-primary font-sm font-medium flex w-full justify-center items-center">
                {renderDailyTimestamps(message, index)}
              </span>

              {/* Mensagem  */}
              <div
                key={message.id}
                className={cn(
                  "group w-fit md:max-w-[90%] flex flex-col relative rounded-xl text-base overflow-hidden justify-center items-start min-h-9 text-foreground ",
                  message.fromMe
                    ? "bg-primary-foreground dark:border dark:bg-background rounded-br-none"
                    : "bg-muted rounded-bl-none",
                  message.mediaType === "chat" ? "p-2" : ""
                )}
              >
                {isGroup && (
                  <p className="text-primary font-medium text-xs">
                    {message.contact?.name}
                  </p>
                )}
                {(message.mediaUrl ||
                  message.mediaType === "location" ||
                  message.mediaType === "vcard") &&
                  checkMessageMedia(message)}

                {message.isDeleted && (
                  <span className="italic flex items-center gap-2">
                    <Trash fontSize="small" className="pr-1" />{" "}
                    <span>Mensagem apagada</span>
                  </span>
                )}
                {message.quotedMsg && renderQuotedMessage(message)}

                {message.mediaType === "audio" ||
                (message.mediaType === "image" &&
                  (message.body.trim().endsWith(".jpeg") ||
                    message.body.trim().endsWith(".webp"))) ||
                message.mediaType === "vcard" ? null : message.mediaType ===
                  "application" ? (
                  <div>
                    <span className="text-sm text-muted-foreground pl-1 pr-1 whitespace-pre-wrap leading-5">
                      {file_name}
                    </span>
                    {file_name !== message.body ? (
                      <div className="pl-1 pr-1 whitespace-pre-wrap leading-5 text-[14.2px]">
                        <MarkdownWrapper>{message.body}</MarkdownWrapper>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  <p className="pl-1 pr-1 whitespace-pre-wrap leading-5 text-[14.2px]">
                    <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  </p>
                )}
                {!message.isDeleted && <MessageOptionsMenu message={message} />}
              </div>

              {/* Hora e confirmacao de entrega */}
              <div className="flex gap-3 justify-center items-center">
                <span className="text-muted-foreground text-xs">
                  {format(parseISO(message.createdAt), "HH:mm")}
                </span>
                {message.fromMe && renderMessageAck(message)}
              </div>
            </div>
          );
      });
      return viewMessagesList;
    } else {
      return <div>Diga olá ao seu novo contato!</div>;
    }
  };

  return (
    <div
      className="h-full w-full px-1 flex gap-2 flex-col overflow-auto relative sm:px-1 lg:px-9 xl:px-12"
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
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MessagesList;
