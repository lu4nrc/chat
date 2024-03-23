import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MicRecorder from "mic-recorder-to-mp3";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MoodIcon from "@mui/icons-material/Mood";
import {
  Box,
  FormControlLabel,
  Hidden,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  styled,
  useTheme,
} from "@mui/material";

import { MoreVert } from "@mui/icons-material";
import {
  Microphone,
  PaperPlaneRight,
  PaperPlaneTilt,
  Paperclip,
  Smiley,
  XCircle,
} from "@phosphor-icons/react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import useLocalStorage from "../../hooks/useLocalStorage";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import RecordingTimer from "./RecordingTimer";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const AntSwitch = styled(Switch)(({ theme }) => ({
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
}));

const MessageInput = ({ ticketStatus }) => {
  const theme = useTheme();
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
  const inputRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  const handleClosesAnswers = () => {
    setTypeBar(false);
    setAnchorElAnswers(null);
  };

  useEffect(() => {
    inputRef.current.focus();
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
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
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
      <Stack
        px={1}
        border={1}
        borderRadius={0.5}
        alignItems={"center"}
        justifyContent="space-between"
        direction={"row"}
      >
        <Stack direction={"column"} spacing={0.5}>
          {!message.fromMe && (
            <Typography variant="body2">{message.contact?.name}</Typography>
          )}
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {message.body}
          </Typography>
        </Stack>

        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <ClearIcon />
        </IconButton>
      </Stack>
    );
  };

  if (medias.length > 0)
    return (
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        px={2}
        py={2}
      >
        {loading ? (
          <div>
            <CircularProgress />
          </div>
        ) : (
          <Typography>{medias[0]?.name}</Typography>
        )}
        <Stack direction={"row"} spacing={1}>
          <IconButton
            aria-label="cancel-upload"
            component="span"
            onClick={(e) => setMedias([])}
          >
            <XCircle size={24} />
          </IconButton>
          <IconButton
            aria-label="send-upload"
            component="span"
            onClick={handleUploadMedia}
            disabled={loading}
          >
            <PaperPlaneRight size={24} />
          </IconButton>
        </Stack>
      </Stack>
    );
  else {
    return (
      <Stack
        px={2}
        py={2}
        borderTop={2}
        borderColor={theme.palette.divider}
        spacing={0.5}
      >
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <Stack
          spacing={1}
          direction={"row"}
          justifyContent={"space-between"}
          alignItems="center"
        >
          <Stack direction={"row"}>
            <Hidden only={["sm", "xs"]}>
              <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                <Box sx={{ position: "relative" }}>
                  <IconButton
                    aria-label="emojiPicker"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                    onClick={() => setShowEmoji((prevState) => !prevState)}
                  >
                    <Smiley size={24} />
                  </IconButton>
                  {showEmoji ? (
                    <Stack sx={{ position: "absolute", bottom: 72 }} zIndex={1}>
                      <Picker
                        data={data}
                        perLine={16}
                        onEmojiSelect={handleAddEmoji}
                      />
                    </Stack>
                  ) : null}
                </Box>
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
                <IconButton
                  aria-label="upload"
                  component="span"
                  disabled={loading || recording || ticketStatus !== "open"}
                >
                  <Paperclip size={24} />
                </IconButton>
              </label>

              <Stack marginLeft={1}>
                <Typography variant="caption">Assinar</Typography>
                <AntSwitch
                  size="small"
                  checked={signMessage}
                  onChange={(e) => {
                    setSignMessage(e.target.checked);
                  }}
                  name="showAllTickets"
                  color="primary"
                />
              </Stack>
            </Hidden>
            <Hidden only={["md", "lg", "xl"]}>
              <IconButton
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleOpenMenuClick}
              >
                <MoreVert></MoreVert>
              </IconButton>
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
                  <FormControlLabel
                    style={{ marginRight: 7, color: "grey" }}
                    label={i18n.t("messagesInput.signMessage")}
                    labelPlacement="start"
                    control={
                      <Switch
                        size="small"
                        checked={signMessage}
                        onChange={(e) => {
                          setSignMessage(e.target.checked);
                        }}
                        name="showAllTickets"
                        color="primary"
                      />
                    }
                  />
                </MenuItem>
              </Menu>
            </Hidden>
          </Stack>
          <TextField
            multiline
            fullWidth
            inputRef={(input) => {
              input && input.focus();
              input && (inputRef.current = input);
            }}
            placeholder="Mensagem..."
            /*           placeholder={
              ticketStatus === "open"
                ? i18n.t("messagesInput.placeholderOpen")
                : i18n.t("messagesInput.placeholderClosed")
            } */
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
          ) : (
            <div></div>
          )}
          {inputMessage ? (
            <IconButton
              aria-label="sendMessage"
              component="span"
              onClick={handleSendMessage}
              disabled={loading}
              style={{ backgroundColor: theme.palette.primary.main }}
            >
              <PaperPlaneTilt color="#fff" />
            </IconButton>
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
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
              style={{ backgroundColor: theme.palette.primary.main }}
            >
              <Microphone size={24} color="#fff" />
            </IconButton>
          )}
        </Stack>
      </Stack>
    );
  }
};

export default MessageInput;
