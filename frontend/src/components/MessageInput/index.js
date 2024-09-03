import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MicRecorder from "mic-recorder-to-mp3";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MoodIcon from "@mui/icons-material/Mood";
import { Menu, MenuItem, Stack, Hidden } from "@mui/material";

import { AuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import useLocalStorage from "../../hooks/useLocalStorage";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import RecordingTimer from "./RecordingTimer";
import { Textarea } from "../ui/textarea";
import {
  EllipsisVertical,
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

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

/* const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 45,
  height: 20,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(20px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(25px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.main
            : theme.palette.primary.main,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 16,
    height: 16,
    borderRadius: 8,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
})); */

const MessageInput = ({ ticketStatus }) => {
  const { theme } = useTheme();
  const { ticketId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElAnswers, setAnchorElAnswers] = useState(null);
  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const textareaRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    textareaRef.current.focus();
  }, [replyingMessage]);

  const handleClosesAnswers = () => {
    setTypeBar(false);
    setAnchorElAnswers(null);
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
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `> *${user?.name}*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };

    console.log(message);
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
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
      toastError(err);
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
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event) => {
    setAnchorEl(null);
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
        {loading ? (
          <div>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-primary" />
          </div>
        ) : (
          <p className="text-sm text-foreground">{medias[0]?.name}</p>
        )}
        <div className="flex gap-2 pr-5">
          <X
            aria-label="cancel-upload"
            onClick={(e) => setMedias([])}
            className="w-5 h-5 text-foreground"
          />
          <div disabled={loading} onClick={handleUploadMedia}>
            <Send size={24} className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    );
  else {
    return (
      <div className="flex flex-col gap-3 bg-muted pt-2 py-3 px-2 w-full">
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 ">
            <div className=" hidden sm:flex gap-1">
              <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
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
              </ClickAwayListener>

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
            <div className="block sm:hidden">
              <EllipsisVertical onClick={handleOpenMenuClick} />

              <Menu
                id="simple-menu"
                keepMounted
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuItemClick}
              >
                <MenuItem onClick={handleMenuItemClick}>
                  <IconButton
                    aria-label="emojiPicker"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                    onClick={(e) => setShowEmoji((prevState) => !prevState)}
                  >
                    <MoodIcon />
                  </IconButton>
                </MenuItem>
                <Stack onClick={handleMenuItemClick}>
                  <input
                    multiple
                    type="file"
                    id="upload-button"
                    disabled={loading || recording || ticketStatus !== "open"}
                    sx={{ display: "none" }}
                    onChange={handleChangeMedias}
                  />
                  <label htmlFor="upload-button">
                    <IconButton
                      aria-label="upload"
                      component="span"
                      disabled={loading || recording || ticketStatus !== "open"}
                    >
                      <Paperclip size={24} />
                    </IconButton>
                  </label>
                </Stack>
                <MenuItem onClick={handleMenuItemClick}>
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
                </MenuItem>
              </Menu>
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
            onKeyDown={(e) => {
              if (loading || e.shiftKey) return;
              else if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          {typeBar ? (
            <Stack>
              <Menu
                anchorEl={anchorElAnswers}
                open={typeBar}
                onClose={handleClosesAnswers}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                {quickAnswers.map((value, index) => {
                  return (
                    <MenuItem
                      key={index}
                      onClick={() => handleQuickAnswersClick(value.message)}
                    >
                      <strong>{value.shortcut}</strong>
                      {` - ${value.message}`}
                    </MenuItem>
                  );
                })}
              </Menu>
            </Stack>
          ) : null}
          {inputMessage ? (
            <Button
              aria-label="sendMessage"
              size="icon"
              onClick={handleSendMessage}
              disabled={loading}
            >
              <Send />
            </Button>
          ) : recording ? (
            <Stack direction={"row"} alignItems={"center"}>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                fontSize="large"
                disabled={loading}
                onClick={handleCancelAudio}
              >
                <HighlightOffIcon />
              </IconButton>
              {loading ? (
                <Stack>
                  <CircularProgress />
                </Stack>
              ) : (
                <RecordingTimer />
              )}

              <IconButton
                aria-label="sendRecordedAudio"
                component="span"
                onClick={handleUploadAudio}
                disabled={loading}
              >
                <CheckCircleOutlineIcon />
              </IconButton>
            </Stack>
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
