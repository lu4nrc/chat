import React, { useEffect, useReducer, useRef, useState } from "react";

import Badge from "@mui/material/Badge";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";

import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import Add from "@mui/icons-material/Add";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import ChatIcon from "@mui/icons-material/Chat";
import Check from "@mui/icons-material/Check";
import Clear from "@mui/icons-material/Clear";
import Link from "@mui/icons-material/Link";
import Person from "@mui/icons-material/Person";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import Settings from "@mui/icons-material/Settings";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { i18n } from "../../translate/i18n";

import InputBase from "@mui/material/InputBase";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Checkbox,
  Chip,
  InputAdornment,
  ListItemSecondaryAction,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import TransmissionImage from "../../assets/transmission.svg";
import { getBackendUrl } from "../../config";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import formatarNumeroTelefone from "../../utils/numberFormat";
import MarkdownWrapper from "../MarkdownWrapper";
import { Clipboard, Paperclip, SealQuestion } from "@phosphor-icons/react";

const handleDate = (date) => {
  var dt = new Date(date);
  return (
    dt.toLocaleDateString("pt-br") +
    " " +
    dt.toLocaleTimeString("pt-br", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};
function replaceEObterBackend(str) {
  const strBackend = "/backend";
  const indexBackend = str.indexOf(strBackend);
  if (indexBackend === -1) {
    return "";
  }
  str = str.slice(indexBackend);
  return str.substr(strBackend.length);
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};
const TransmissionModal = ({ open, onClose, transmission }) => {
  const theme = useTheme();
  const isMounted = useRef(true);
  const listRef = React.createRef();
  const hiddenFileInput = React.useRef(null);
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(0);
  const [contacts, dispatch] = useReducer(reducer, []);
  const [msgs, setMsgs] = useState([]);
  const [contactsSelected, setContactsSelected] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allContacts, setAllContacts] = useState(false);
  const [transmissionName, setTransmissionName] = useState("");

  const [enableSteps, setEnableSteps] = useState([false, true, true, true]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });

          setHasMore(data.hasMore);
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setLoading(false);
        } catch (err) {
          const errorMsg =
          err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);
  useEffect(() => {
    if (transmission !== null) {
      setContactsSelected(transmission.contacts);
      setMsgs(transmission.messages);
      setTransmissionName(transmission.name);
    }
  }, [transmission]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* Reset component */
  const handleClose = () => {
    setStep(0);
    setValue(0);
    setMsgs([]);
    setContactsSelected([]);
    setInputText("");
    setHasMore(true);
    setLoading(false);
    setAllContacts(false);
    setTransmissionName("");
    onClose();
  };

  const handleClick = (_) => {
    hiddenFileInput.current.click();
  };
  const handleMessage = (_) => {
    var msgUpdated = msgs;
    msgUpdated.push({
      type: "text",
      value: inputText,
      date: Date(),
    });
    setMsgs([...msgUpdated]);
    setInputText("");
  };
  const handleFile = (e) => {
    var msgUpdated = msgs;
    msgUpdated.push({
      type: "img",
      value: e.target.files[0],
      date: Date(),
    });
    setMsgs([...msgUpdated]);
  };
  const handleInputText = (e) => {
    setInputText(e.target.value);
  };
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };
  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };
  const removeMsg = (index) => {
    var m = msgs;
    m.splice(index, 1);
    setMsgs([...m]);
  };
  const removerAcentos = (str) => {
    let mapaAcentos = {
      a: /[\xE0-\xE6]/g,
      e: /[\xE8-\xEB]/g,
      i: /[\xEC-\xEF]/g,
      o: /[\xF2-\xF6]/g,
      u: /[\xF9-\xFC]/g,
      c: /\xE7/g,
      n: /\xF1/g,
    };
    for (let letra in mapaAcentos) {
      let expressaoRegular = mapaAcentos[letra];
      str = str.replace(expressaoRegular, letra);
    }
    str = str.replace(/[^a-zA-Z0-9 .]/g, "");
    return str;
  };

  useEffect(() => {}, [msgs]);
  const save = async () => {
    const formData = new FormData();
    var msgsParsed = msgs.map((msg) => {
      if (msg.type === "img") {
        if (msg.value?.name) {
          formData.append(
            "medias",
            msg.value,
            msg.value?.name
              ? removerAcentos(msg.value.name)
              : removerAcentos(msg.value)
          );
          return {
            type: msg.type,
            value: msg.value.name
              ? removerAcentos(msg.value.name)
              : removerAcentos(msg.value),
            date: msg.date,
          };
        } else {
          return msg;
        }
      } else {
        return msg;
      }
    });

    var contactsParsed = contactsSelected.map((contact) => {
      return {
        name: contact.name,
        number: contact.number,
        email: contact.email,
        isGroup: contact.isGroup,
        id: contact.id,
      };
    });
    formData.append("allContacts", allContacts);
    formData.append(
      "contacts",
      allContacts ? [] : JSON.stringify(contactsParsed)
    );
    formData.append("msgs", JSON.stringify(msgsParsed));
    formData.append("name", transmissionName);
    try {
      if (transmission?.id) {
        await api.post(`/transmission/update/${transmission.id}`, formData);
      } else {
        await api.post("/transmission/", formData);
      }
      toast.success(
        transmission.id
          ? "Lista de transmissão atualizada com sucesso"
          : "Lista de transmissão criada com sucesso",
        {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        }
      );
      handleClose();
    } catch (err) {
      handleClose();
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
  };

  useEffect(() => {
    if (contactsSelected.length <= 0) {
      setEnableSteps([false, true, true, true]);
    }
    if (contactsSelected.length > 0) {
      setEnableSteps([false, false, true, true]);
    }
    if (contactsSelected.length > 0 && msgs.length > 0) {
      setEnableSteps([false, false, false, true]);
    }
    if (contactsSelected.length > 0 && msgs.length <= 0) {
      setEnableSteps([false, false, true, true]);
    }
    if (contactsSelected.length > 0 && msgs.length > 0) {
      setEnableSteps([false, false, false, true]);
    }
    if (
      contactsSelected.length > 0 &&
      msgs.length > 0 &&
      transmissionName.length >= 5
    ) {
      setEnableSteps([false, false, false, false]);
    }
  }, [contactsSelected, msgs, transmissionName]);
  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"md"}>
      {step !== 2 ? (
        <>
          <DialogTitle id="form-dialog-title" variant="h4">
            Lista de transmissão
          </DialogTitle>
          <Box sx={{ position: "absolute", right: 0 }}>
            <Chip label="Versão BETA" color="primary" sx={{ color: "white" }} />
          </Box>
          <Stack>
            {step === 0 ? (
              <>
                {/* +++++++++ STEP 1 +++++++++++++++++ */}
                <Stack
                  p={1}
                  direction={"row"}
                  gap={1}
                  sx={{
                    height: 512,
                    width: "100%",
                    border: `1px solid ${theme.palette.grey[300]}`,
                  }}
                >
                  {/* Left */}
                  <Stack flex={1} spacing={0.5} p={1} borderRadius={1}>
                    <Typography variant="h5" fontWeight={"bold"}>
                      {" "}
                      Lista de contatos
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={300}
                      color={theme.palette.text.secondary}
                      paddingBottom={1.5}
                    >
                      Adicione o contato à lista ao clicar em qualquer lugar do
                      cartão.
                    </Typography>
                    <TextField
                      variant="outlined"
                      value={searchParam}
                      onChange={(e) =>
                        setSearchParam(e.target.value.toLowerCase())
                      }
                      placeholder="Digite o nome do contato"
                      type="search"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon style={{ color: "grey" }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <List
                      sx={{
                        width: "100%",
                        height: "fit-content",
                        overflowY: "scroll",
                        border: `1px solid ${theme.palette.grey[300]}`,
                        borderRadius: "5px",
                      }}
                      onScroll={handleScroll}
                    >
                      {contacts.map((contact, index) => (
                        <ListItem
                          sx={{
                            backgroundColor: `${theme.palette.background.neutral}`,
                            marginBottom: 1,
                            borderRadius: "5px",
                          }}
                          button
                          key={index}
                          onClick={() => {
                            setContactsSelected((prevState) => {
                              const removeIndex = contactsSelected.findIndex(
                                (item) => item.id === contact.id
                              );
                              if (removeIndex === -1) {
                                if (contactsSelected.length <= 197) {
                                  return [...prevState, contact];
                                } else {
                                  return [...prevState];
                                }
                              } else {
                                var t = contactsSelected;
                                t.splice(removeIndex, 1);
                                return [...t];
                              }
                            });
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              alt="Profile Picture"
                              src={contact.profilePicUrl}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={contact.name}
                            secondary={
                              contact.number.length > 14
                                ? "Grupo"
                                : formatarNumeroTelefone(contact.number)
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={() => {
                                setContactsSelected((prevState) => {
                                  const removeIndex =
                                    contactsSelected.findIndex(
                                      (item) => item.id === contact.id
                                    );
                                  if (removeIndex === -1) {
                                    if (contactsSelected.length <= 256) {
                                      return [...prevState, contact];
                                    } else {
                                      return [...prevState];
                                    }
                                  } else {
                                    var t = contactsSelected;
                                    t.splice(removeIndex, 1);
                                    return [...t];
                                  }
                                });
                              }}
                            >
                              <Checkbox
                                checked={
                                  allContacts
                                    ? true
                                    : contactsSelected.some((element) => {
                                        if (element.id === contact.id) {
                                          return true;
                                        }
                                        return false;
                                      })
                                }
                              />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>

                  {/* Right */}
                  <Stack flex={1} spacing={0.5} p={1} borderRadius={1}>
                    <Stack direction={"row"} spacing={2}>
                      <Typography variant="h5" fontWeight={"bold"}>
                        {" "}
                        Contatos selecionados
                      </Typography>
                      <Badge
                        badgeContent={contactsSelected.length}
                        color="primary"
                        style={{ marginRight: 20 }}
                      >
                        <Person color="action" />
                      </Badge>
                      {contactsSelected.length > 97 ? (
                        <Typography
                          variant="caption"
                          color={theme.palette.error.dark}
                        >
                          Máximo atingido
                        </Typography>
                      ) : null}
                    </Stack>
                    <Typography
                      variant="body2"
                      fontWeight={300}
                      color={theme.palette.text.secondary}
                      paddingBottom={1.5}
                    >
                      Remova o contato da lista ao clicar em qualquer parte do
                      cartão.
                    </Typography>
                    <List
                      sx={{
                        width: "100%",
                        height: "100%",
                        overflowY: "scroll",
                        border: `1px solid ${theme.palette.grey[300]}`,
                        borderRadius: "5px",
                      }}
                      onScroll={handleScroll}
                    >
                      {contactsSelected.map((contact, index) => (
                        <ListItem
                          sx={{
                            backgroundColor: `${theme.palette.background.neutral}`,
                            marginBottom: 1,
                            borderRadius: "5px",
                          }}
                          button
                          key={index}
                          onClick={() => {
                            setContactsSelected((prevState) => {
                              const removeIndex = contactsSelected.findIndex(
                                (item) => item.id === contact.id
                              );
                              if (removeIndex === -1) {
                                if (contactsSelected.length <= 97) {
                                  return [...prevState, contact];
                                } else {
                                  return [...prevState];
                                }
                              } else {
                                var t = contactsSelected;
                                t.splice(removeIndex, 1);
                                return [...t];
                              }
                            });
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              alt="Profile Picture"
                              src={contact.profilePicUrl}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={contact.name}
                            secondary={
                              contact.number.length > 14
                                ? "Grupo"
                                : formatarNumeroTelefone(contact.number)
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={() => {
                                setContactsSelected((prevState) => {
                                  const removeIndex =
                                    contactsSelected.findIndex(
                                      (item) => item.id === contact.id
                                    );
                                  if (removeIndex === -1) {
                                    if (contactsSelected.length <= 256) {
                                      return [...prevState, contact];
                                    } else {
                                      return [...prevState];
                                    }
                                  } else {
                                    var t = contactsSelected;
                                    t.splice(removeIndex, 1);
                                    return [...t];
                                  }
                                });
                              }}
                            >
                              {/*                               <Checkbox
                                checked={
                                  allContacts
                                    ? true
                                    : contactsSelected.some((element) => {
                                        if (element.id === contact.id) {
                                          return true;
                                        }
                                        return false;
                                      })
                                }
                              /> */}
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </Stack>
              </>
            ) : (
              /* +++++++++ STEP 2 +++++++++++++++++ */
              <Stack
                p={1}
                direction={"row"}
                gap={1}
                sx={{
                  height: 512,
                  width: "100%",
                  border: `1px solid ${theme.palette.grey[300]}`,
                }}
              >
                <Stack flexDirection={"column"} flex={1} spacing={1}>
                  {/*  + Box Message */}
                  <Box
                    ref={listRef}
                    sx={{
                      width: "100%",
                      height: "100%",
                      overflowY: "scroll",
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: "5px",
                    }}
                  >
                    {msgs.map((msg, key) => {
                      return (
                        <>
                          {/* Message */}
                          <Stack key={key} p={1}>
                            {msg.type !== "img" ? (
                              <Stack
                                py={0.5}
                                px={1}
                                borderRadius={"5px"}
                                position={"relative"}
                                bgcolor={theme.palette.background.neutral}
                              >
                                <Typography variant="body2" fontWeight={300}>
                                  <MarkdownWrapper>{msg.value}</MarkdownWrapper>
                                </Typography>

                                <IconButton
                                  sx={{ position: "absolute", right: 0 }}
                                  type="button"
                                  aria-label="search"
                                  size="small"
                                  onClick={() => removeMsg(key)}
                                >
                                  <Clear />
                                </IconButton>
                              </Stack>
                            ) : (
                              <Stack
                                py={1}
                                px={1}
                                borderRadius={"5px"}
                                position={"relative"}
                                bgcolor={theme.palette.background.neutral}
                                sx={{
                                  maxWidth: 200,
                                  maxHeight: 250,
                                  overflow: "hidden",
                                  borderRadius: "8px",
                                }}
                              >
                                <img
                                  src={
                                    msg.value.name
                                      ? URL.createObjectURL(msg.value)
                                      : `${
                                          getBackendUrl() +
                                          replaceEObterBackend(msg.value)
                                        }`
                                  }
                                  alt={msg.value.name}
                                  style={{
                                    objectFit: "cover",
                                    objectPosition: "center",
                                    borderRadius: "5px",
                                  }}
                                />

                                <IconButton
                                  sx={{ position: "absolute", right: 0 }}
                                  type="button"
                                  aria-label="search"
                                  size="small"
                                  onClick={() => removeMsg(key)}
                                >
                                  <Clear />
                                </IconButton>
                              </Stack>
                            )}
                          </Stack>
                        </>
                      );
                    })}

                    <AlwaysScrollToBottom />
                  </Box>
                  <Stack flexDirection={"row"}>
                    <TextField
                      rows={4}
                      fullWidth
                      multiline
                      value={inputText}
                      onChange={handleInputText}
                      placeholder="Digite uma mensagem ou adicione arquivo"
                    />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <IconButton
                        type="button"
                        sx={{ p: "10px" }}
                        aria-label="search"
                        onClick={handleMessage}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        sx={{ p: "10px" }}
                        aria-label="menu"
                        onClick={handleClick}
                      >
                        <input
                          type="file"
                          ref={hiddenFileInput}
                          onChange={handleFile}
                          style={{ display: "none" }}
                        />
                        <Paperclip />
                      </IconButton>
                    </Box>
                  </Stack>
                </Stack>

                {/*                <InputBase
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleMessage();
                      }
                    }}
                    value={inputText}
                    onChange={handleInputText}
                    style={{ width: 350 }}
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Digite uma mensagem ou envie algum arquivo"
                  /> */}
                <Stack flex={1} position={"relative"} p={2}>
                  <Tooltip
                    sx={{ position: "absolute", right: 0 }}
                    title="                    É possível adicionar um arquivo ao corpo da sua lista de
                    transmissão no ícone de clipe de papel proximo ao icone +, clicando no símbolo de adição
                    +, você pode inserir uma mensagem. Sinta-se à vontade
                    para personalizá-la."
                  >
                    <IconButton>
                      <SealQuestion />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="h4">Configurações</Typography>
                  <Typography variant="body2" fontWeight={300}>
                    Vamos lá, digite um bom nome para sua lista de transmissão.
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleMessage();
                      }
                    }}
                    value={transmissionName}
                    onChange={(v) => setTransmissionName(v.target.value)}
                    placeholder="Digite o nome da lista de transmissão"
                  />
                  <Typography
                    mt={4}
                    variant="body2"
                    color={theme.palette.info.main}
                  >
                    Atenção!
                  </Typography>
                  <Typography variant="body2" color={theme.palette.info.main}>
                    O uso indiscriminado da lista de transmissão do WhatsApp
                    pode resultar em bloqueios da sua conta. Por favor, use essa
                    função com responsabilidade e evite enviar mensagens em
                    massa para evitar violações dos termos de uso do WhatsApp.
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </>
      ) : (
        /* FIM */
        <></>
      )}
      <Paper /* className={classes.bottomNavigation} */ elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction
            label="Contatos"
            icon={<RecentActorsIcon />}
            disabled={enableSteps[0]}
            onClick={() => setStep(0)}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowForwardIos color={step === 0 ? "primary" : "disabled"} />
          </div>
          <BottomNavigationAction
            label="Mensagem"
            icon={<ChatIcon />}
            disabled={enableSteps[1]}
            onClick={() => setStep(1)}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowForwardIos color={step === 1 ? "primary" : "disabled"} />
          </div>
          {/*          <BottomNavigationAction
            label="Configurações"
            icon={<Settings />}
            onClick={() => setStep(2)}
            disabled={enableSteps[2]}
          /> */}
          <BottomNavigationAction
            label="Salvar"
            disabled={enableSteps[3]}
            /* className={!enableSteps[3] ? classes.saveButton : null} */
            icon={<Check />}
            onClick={save}
          />
        </BottomNavigation>
      </Paper>
    </Dialog>
  );
};

export default TransmissionModal;
