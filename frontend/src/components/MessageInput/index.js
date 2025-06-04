import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import MicRecorder from "mic-recorder-to-mp3";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import TanStack Query hooks

//import { Menu, MenuItem } from "@mui/material";

import { AuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import useLocalStorage from "../../hooks/useLocalStorage";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import RecordingTimer from "./RecordingTimer";
import { Textarea } from "../ui/textarea";
import {
  Check,
  File,
  LoaderCircle,
  Mic,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react";
import { useTheme } from "../theme/theme-provider";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Switch } from "../ui/switch";
import { useToast } from "@/hooks/use-toast";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const MessageInput = ({ ticketStatus }) => {
  const { theme } = useTheme();
  const { ticketId } = useParams();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false); // This might be used by media/audio, keep for now
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // Índice selecionado
  const textareaRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get queryClient instance

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    textareaRef.current.focus();
  }, [replyingMessage]);

  const handleClosesAnswers = () => {
    setTypeBar(false);
  };

  useEffect(() => {
    textareaRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  const handleChangeInput = (e) => {
    setInputMessage(e.target.value);
    handleLoadQuickAnswer(e.target.value);
  };

  const handleQuickAnswersClick = (value) => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }

    setLoading(false);
    setMedias([]);
  };

  // Função para destacar parte do shortcut que coincide com o input
  const highlightShortcut = (shortcut) => {
    const typedText = inputMessage.substring(1); // Remove o "/" da busca
    const matchIndex = shortcut.toLowerCase().indexOf(typedText.toLowerCase());

    if (matchIndex === 0 && typedText !== "") {
      return (
        <>
          <span className="text-primary">
            {shortcut.substring(0, typedText.length)}
          </span>
          {shortcut.substring(typedText.length)}
        </>
      );
    }
    return shortcut;
  };

  const { mutate: sendTextMessage, isLoading: isSendingTextMessage } = useMutation(
    (newMessage) => api.post(`/messages/${ticketId}`, newMessage),
    {
      onSuccess: (data) => {
        // Assuming 'data' from api.post is the newly created message object from the server
        const newMessage = data.data; // Adjust if API response structure is different (e.g., just data)

        queryClient.setQueryData(['messages', ticketId], (oldData) => {
          if (!oldData || !oldData.pages) {
            // If cache is empty or has wrong structure, maybe initialize or log
            // For now, just return oldData to prevent errors, or initialize structure:
            // return { pages: [{ messages: [newMessage], hasMore: true, nextPageNumber: 2 }], pageParams: [1] };
            return oldData;
          }

          const newPagesArray = oldData.pages.map((page, index) => {
            if (index === oldData.pages.length - 1) { // Add to the last page
              return {
                ...page,
                messages: [...page.messages, newMessage],
              };
            }
            return page;
          });
          return { ...oldData, pages: newPagesArray };
        });
        // TODO: Call scrollToBottom() if accessible or manage globally
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: toastError(error),
        });
      }
    }
  );

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    // setLoading(true); // Replaced by isSendingTextMessage from useMutation

    const messagePayload = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `> *${user?.name}*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };

    sendTextMessage(messagePayload); // Call the mutation

    setInputMessage("");
    setShowEmoji(false);
    // setLoading(false); // Replaced by isSendingTextMessage
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
      setLoading(false);
      setRecording(false);
    }
  };

  const handleLoadQuickAnswer = async (value) => {
    if (value && value.indexOf("/") === 0) {
      try {
        const { data } = await api.get("/quickAnswers/", {
          params: { searchParam: inputMessage.substring(1) },
        });
        setQuickAnswer(data.quickAnswers);

        if (data.quickAnswers.length > 0) {
          setTypeBar(true);
          setSelectedIndex(0);
        } else {
          setTypeBar(false);
        }
      } catch (err) {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.shiftKey) return;

    if (e.key === "Enter") {
      if (typeBar && quickAnswers.length > 0) {
        // Seleciona a resposta rápida com base no índice selecionado
        setInputMessage(quickAnswers[selectedIndex].message);
        setTypeBar(false);
      } else {
        handleSendMessage();
      }
      e.preventDefault(); // Evita pular uma linha ao pressionar Enter
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  const renderReplyingMessage = (message) => {
    return (
      <div className=" flex items-center justify-between">
        <div className="flex w-full border-l-4 border-primary flex-col bg-background rounded-lg p-2">
          {!message.fromMe && (
            <p className="text-sm font-medium text-foreground">
              {message.contact?.name}
            </p>
          )}
          <p className="text-sm font-normal text-muted-foreground">
            {message.body}
          </p>
        </div>
        <X
          className="text-foreground"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        />
      </div>
    );
  };

  if (medias.length > 0)
    return (
      <div className="flex items-center bg-muted justify-between px-2 py-4 w-full">
        <div className="flex gap-1 ">
          <File className="w-4 h-4 text-primary"/>
          <p className="text-sm text-foreground">{medias[0]?.name}</p>
        </div>

        <div className="flex gap-2 pr-5">
          <Button
            disabled={loading}
            onClick={(e) => setMedias([])}
            variant="outline"
          >
            <X aria-label="cancel-upload" className="w-5 h-5 text-foreground" />
          </Button>
          <Button disabled={loading} onClick={handleUploadMedia}>
            <div className="flex gap-1">
              {loading && <LoaderCircle className=" h-5 w-5 animate-spin" />}
              <Send size={24} className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </div>
    );
  else {
    return (
      <div className="flex flex-col gap-3 bg-muted pt-2 py-3 px-2 w-full">
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        {typeBar && quickAnswers.length > 0 ? (
          <div className="flex flex-col">
            {quickAnswers.map((value, index) => {
              return (
                <div
                  className={`grid grid-cols-[auto_1fr] gap-2 py-1 px-2 rounded-md cursor-pointer ${
                    index === selectedIndex
                      ? "bg-background"
                      : "hover:bg-background"
                  }`}
                  key={index}
                  onClick={() => handleQuickAnswersClick(value.message)}
                >
                  <p className="text-sm font-bold">
                    {highlightShortcut(value.shortcut)}
                  </p>

                  <p className="text-sm text-muted-foreground truncate">
                    {value.message}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 ">
            <div className=" hidden sm:flex gap-1">
              <div className="relative">
                <Smile
                  className="text-muted-foreground"
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={() => setShowEmoji((prevState) => !prevState)}
                />

                {showEmoji ? (
                  <div className="absolute bottom-16 z-10">
                    <Picker
                      theme={theme}
                      data={data}
                      perLine={16}
                      onEmojiSelect={handleAddEmoji}
                    />
                  </div>
                ) : null}
              </div>

              <input
                style={{ display: "none" }}
                multiple
                type="file"
                id="upload-button"
                disabled={loading || recording || ticketStatus !== "open"}
                sx={{ display: "none" }}
                onChange={handleChangeMedias}
              />
              <label htmlFor="upload-button">
                <Paperclip
                  className="text-muted-foreground"
                  disabled={loading || recording || ticketStatus !== "open"}
                />
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={signMessage}
                      onCheckedChange={() =>
                        setSignMessage((prevState) => !prevState)
                      }
                      id="Assinar"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Assinar</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Textarea
            className={"min-h-[42px] h-[42px] max-h-[80px]"}
            ref={(input) => {
              textareaRef.current = input;
              if (input) {
                input.focus();
              }
            }}
            placeholder="Mensagem..."
            value={inputMessage}
            onChange={handleChangeInput}
            disabled={recording || loading || ticketStatus !== "open"}
            onPaste={(e) => {
              ticketStatus === "open" && handleInputPaste(e);
            }}
            onKeyDown={handleKeyDown}
            spellCheck={true}
          />

          {inputMessage ? (
            <Button
              aria-label="sendMessage"
              onClick={handleSendMessage}
              disabled={isSendingTextMessage || loading} // Use isSendingTextMessage here
            >
              {isSendingTextMessage ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send />}
            </Button>
          ) : recording ? (
            <div className="flex items-center gap-1">
              <Button
                aria-label="cancelRecording"
                disabled={loading} // Assuming 'loading' is for other operations like media upload
                onClick={handleCancelAudio}
              >
                <X />
              </Button>
              {loading && !isSendingTextMessage ? ( // Show general loader if not sending text
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-primary" />
              ) : (
                <RecordingTimer />
              )}

              <Button
                aria-label="sendRecordedAudio"
                onClick={handleUploadAudio}
                disabled={loading} // Assuming 'loading' is for other operations
              >
                <Check />
              </Button>
            </div>
          ) : (
            <Button
              aria-label="showRecorder"
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
            >
              <Mic size={24} color="#fff" />
            </Button>
          )}
        </div>
      </div>
    );
  }
};

export default MessageInput;
