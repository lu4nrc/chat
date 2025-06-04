import { format, isSameDay, parseISO } from "date-fns";
import React, { useEffect, useReducer, useRef, useCallback } from "react"; // Added useCallback
import openSocket from "../../services/socket-io";
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Import TanStack Query hooks

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
  File,
  Info,
  LoaderCircle,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  // const [messagesList, dispatch] = useReducer(reducer, []); // Will be replaced by useInfiniteQuery
  // const [pageNumber, setPageNumber] = useState(1); // Managed by useInfiniteQuery
  // const [hasMore, setHasMore] = useState(false); // Managed by useInfiniteQuery (hasNextPage)
  // const [loading, setLoading] = useState(true); // Managed by useInfiniteQuery (isLoading, isFetching)
  const lastMessageRef = useRef();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // For potential cache updates later

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  // const currentTicketId = useRef(ticketId); // Not strictly needed with queryKey invalidation

  const fetchMessages = async ({ pageParam = 1 }) => {
    const { data } = await api.get(`/messages/${ticketId}`, {
      params: { pageNumber: pageParam },
    });
    // Adapt data structure for useInfiniteQuery:
    // It expects an object where your actual data array is, plus pagination info
    return { messages: data.messages, hasMore: data.hasMore, nextPageNumber: pageParam + 1 };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    // error, // good to handle errors
    // status, // 'pending', 'error', 'success'
  } = useInfiniteQuery({
    queryKey: ['messages', ticketId],
    queryFn: fetchMessages,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? lastPage.nextPageNumber : undefined;
    },
    // staleTime: 1000 * 60 * 1, // Optional: 1 minute
    // refetchOnWindowFocus: false, // Optional
  });

  const messagesList = data?.pages?.flatMap(page => page.messages) ?? [];
  // The reducer and dispatch are no longer needed for displaying messages from socket events here.
  // We will use queryClient.setQueryData directly.
  // const [, dispatch] = useReducer(reducer, messagesList); // Remove this line


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

  /*
    The useEffect that dispatched "RESET" and setPageNumber is no longer needed.
    TanStack Query handles data fetching when ticketId (part of queryKey) changes.
    If explicit cache clearing is desired on ticketId change, it can be done via:
    useEffect(() => {
      // queryClient.removeQueries(['messages', oldTicketId]); // if you have oldTicketId
      // or queryClient.resetQueries(['messages', ticketId]) before a new fetch if needed.
      // However, just changing the queryKey typically suffices.
    }, [ticketId, queryClient]);
  */

  // const [, setTicket] = useState({}); // If setTicket was only for API response, might not be needed
  const stackRef = useRef(null);
  // const previousScrollHeightRef = useRef(0); // May need different logic for scroll restoration

  // Scroll restoration logic might need adjustment with how data is loaded by useInfiniteQuery
  // useEffect(() => {
  //   restoreScrollPosition();
  // }, [messagesList]); // messagesList is now derived from `data`

  // const restoreScrollPosition = () => {
  //   if (stackRef.current) {
  //     const scrollDifference =
  //       stackRef.current.scrollHeight - previousScrollHeightRef.current;
  //     stackRef.current.scrollTop += scrollDifference;
  //   }
  // };

  // Old useEffect for fetching messages is removed. useInfiniteQuery handles this.

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("appMessage", (socketData) => {
      if (socketData.action === "create") {
        queryClient.setQueryData(['messages', ticketId], (oldData) => {
          if (!oldData) return oldData;

          // Check if message already exists to prevent duplicates (e.g., if sender gets it via socket too)
          const messageExists = oldData.pages.some(page =>
            page.messages.some(msg => msg.id === socketData.message.id)
          );
          if (messageExists) return oldData;

          const newPagesArray = oldData.pages.map((page, index) => {
            if (index === oldData.pages.length - 1) { // Add to the last page
              return {
                ...page,
                messages: [...page.messages, socketData.message],
              };
            }
            return page;
          });
          return { ...oldData, pages: newPagesArray };
        });
        scrollToBottom();
      }

      if (socketData.action === "update") {
        queryClient.setQueryData(['messages', ticketId], (oldData) => {
          if (!oldData) return oldData;
          const newPagesArray = oldData.pages.map(page => ({
            ...page,
            messages: page.messages.map(msg =>
              msg.id === socketData.message.id ? socketData.message : msg
            ),
          }));
          return { ...oldData, pages: newPagesArray };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, queryClient]); // Added queryClient to dependencies

  // const loadMore = () => { // Replaced by fetchNextPage
  //   setPageNumber((prevPageNumber) => prevPageNumber + 1);
  // };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasNextPage || isFetchingNextPage) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop < 10) { // Threshold to trigger load more
      fetchNextPage();
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
        <div className="flex gap-1 justify-center items-center">
          <Button
            size="icon"
            className="m-1"
            onClick={() => baixarArquivoSemHash(message.mediaUrl, nomeArquivo)} // Chama a função para baixar o arquivo sem a hash
          >
            <Download className="pr-1" />
          </Button>
          <File className="w-4 h-4 text-primary" />
        </div>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <Clock size={18} className="text-muted-foreground" />;
    }
    if (message.ack === 1) {
      return <Check size={18} className="text-muted-foreground" />;
    }
    if (message.ack === 2) {
      return <CheckCheck size={18} className="text-muted-foreground" />;
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

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={cn(
          "flex flex-col w-full rounded-lg bg-background mb-2",
          message.quotedMsg.mediaType === "chat"
            ? "px-1 py-2  border-l-4 border-primary"
            : "px-1 py-2",
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
      // This useEffect might need adjustment.
      // Scrolling to bottom on initial load or when new messages arrive (via socket)
      // For initial load, useInfiniteQuery's `data` can be a trigger.
    }
  // }, [messagesList, pageNumber]); // pageNumber is no longer a state here
  }, [messagesList]);


  const renderMessages = () => {
    if (isLoading && !data) { // Initial loading state
      return (
        <div className="flex justify-center items-center h-full">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!messagesList || messagesList.length === 0) {
      return <div className="flex justify-center items-center h-full">Diga olá ao seu novo contato!</div>;
    }

    // `messagesList` is already derived from `data.pages.flatMap(page => page.messages)`
    const viewMessagesList = messagesList.map((message, index) => {
      const messageClasses = cn(
        "group  md:max-w-[90%]", // Removed some fixed layout classes to be more flexible
        "flex flex-col relative rounded-xl text-base overflow-hidden justify-center min-h-9 text-foreground",
        message.fromMe
          ? "rounded-br-none bg-sky-100 text-sky-900 dark:text-muted-foreground dark:bg-slate-900"
            : "bg-muted rounded-bl-none text-slate-800 dark:text-muted-foreground",
          message.mediaType === "chat"
            ? "p-2 flex-col"
            : ["application", "text"].includes(message.mediaType)
            ? "flex-row items-center"
            : "flex-col items-start"
        );
        //console.log(message)
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
              <div key={message.id} className={messageClasses}>
                {isGroup && (
                  <p className="text-primary font-medium text-xs p-1">
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
                    {file_name !== removerHashDoNomeDoArquivo(message.body) ? (
                      <span className="pl-1 pr-1 whitespace-pre-wrap leading-5 text-[14.2px]">
                        <MarkdownWrapper>{message.body}</MarkdownWrapper>
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                ) : message.mediaType === "exceededfile" ? (
                  <div className="grid gap-1 grid-cols-[auto_1fr] items-center justify-center p-1">
                    <Info className="text-yellow-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        O tamanho do arquivo excede o limite de 20 MB.
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-pre-wrap leading-5 truncate">
                        {message.body}
                      </span>
                    </div>
                  </div>
                ) : message.mediaType === "location" ? (
                  " "
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
      {isFetchingNextPage && ( // Show loader at the top when fetching more
         <div className="flex justify-center py-2">
           <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
         </div>
      )}
      {renderMessages()}
      {/* Removed old loading overlay, handled by isLoading/isFetchingNextPage indicators */}
    </div>
  );
};

export default MessagesList;
