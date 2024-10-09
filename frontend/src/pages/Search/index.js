/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState, useReducer } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../services/api";

import { WhatsappLogo } from "@phosphor-icons/react";

import dayjs from "dayjs";

import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toastError from "@/errors/toastError";
import Maintenance from "@/components/Maintenance";
import { Badge } from "@/components/ui/badge";

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

const Search = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const [searchParam, setSearchParam] = useState("");
  const [userId, setUserId] = useState("");
  const [queueId, setQueueId] = useState("");
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [tickets, dispatch] = useReducer(reducer, []);
  const [dates, setDates] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState(null);
  const { toast } = useToast();
  // const handleSearch = (event) => {
  //   setSearchParam(event.target.value.toLowerCase());
  // };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
    setLoading(true);
    setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/tickets/search", {
            params: {
              dateInitial:
                dates[0]?.$d != null ? dayjs(dates[0].$d).toString() : null,
              dateFinal:
                dates[1]?.$d != null ? dayjs(dates[1].$d).toString() : null,
              userId: userId,
              queue: queueId,
              // searchParam: searchParam,
              pageNumber: pageNumber,
              status: status,
            },
          });
          dispatch({
            type: "LOAD_CONTACTS",
            payload: data.chats,
          });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toast({
            variant: "destructive",
            title: toastError(err),
          });
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };
  const fetchTicketsGeneral = async () => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setLoading(true);
    try {
      const { data } = await api.get("/tickets/search", {
        params: {
          dateInitial:
            dates[0]?.$d != null ? dayjs(dates[0].$d).toString() : null,
          dateFinal:
            dates[1]?.$d != null ? dayjs(dates[1].$d).toString() : null,
          userId: userId,
          queue: queueId,
          // searchParam: searchParam,
          pageNumber: pageNumber,
          status: status,
        },
      });
      setHasMore(data.hasMore);
      dispatch({
        type: "LOAD_CONTACTS",
        payload: data.chats,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
    setLoading(false);
  };

  const fetchInitialData = useCallback(() => {
    const fetch = async () => {
      try {
        const usersData = await api.get("/users");
        const queueData = await api.get("/queue");
        setUsers(usersData.data.users);
        setQueue(queueData.data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleStatusLabel = (status) => {
    switch (status) {
      case "closed":
        return "Fechado";
      case "open":
        return "Aberto";
      default:
        return "Aguardando";
    }
  };
  return (
    <>
     {/*  <div className="h-full flex flex-col gap-2 p-4 sm:px-6 sm:py-2 md:gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
            Atendimentos
          </h1>
          <Badge className="ml-auto sm:ml-0">Beta</Badge>
        </div>
        <div className="grid ">
          <StyledInput
            size="small"
            placeholder="Localizar Mensagem..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "grey" }} />
                </InputAdornment>
              ),
            }}
          />

          <div direction={"row"} flex={1}>
            <DateRangePicker
              localeText={{
                start: "Data Inicial",
                end: "Data Final",
              }}
              slotProps={{ textField: { size: "small" } }}
              onChange={(v) => setDates(v)}
              closeOnSelect
              sx={{ width: 300, marginRight: 2 }}
            />
          </div>
          <div direction={"row"} spacing={2} flex={1} justifyContent="flex-end">
            <TextField
              sx={{ width: 150 }}
              select
              label="Departamento"
              shrink="true"
              value={queueId}
              name="searchQueueId"
              size="small"
            >
              {queue.map((e) => {
                return (
                  <MenuItem
                    value={e.id}
                    key={e.id}
                    onClick={() => {
                      if (e.id === queueId) {
                        setQueueId("");
                      } else {
                        setQueueId(e.id);
                      }
                    }}
                  >
                    {e.name}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              sx={{ width: 150 }}
              select
              label="Usuário"
              shrink="true"
              value={userId}
              name="searchUserId"
              size="small"
            >
              {users.map((e) => {
                return (
                  <MenuItem
                    value={e.id}
                    key={e.id}
                    onClick={() => {
                      if (e.id === userId) {
                        setUserId("");
                      } else {
                        setUserId(e.id);
                      }
                    }}
                  >
                    {e.name}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              sx={{ width: 150 }}
              select
              label="Status"
              shrink="true"
              value={status}
              name="status"
              size="small"
            >
              {["open", "closed", "pending"].map((e) => {
                return (
                  <MenuItem
                    value={e}
                    key={e}
                    onClick={() => {
                      if (e === status) {
                        setStatus(null);
                      } else {
                        setStatus(e);
                      }
                    }}
                  >
                    {e === "open"
                      ? "Aberto"
                      : e === "closed"
                      ? "Fechado"
                      : "Aguardando"}
                  </MenuItem>
                );
              })}
            </TextField>
          </div>
          <Button
            variant="contained"
            onClick={fetchTicketsGeneral}
            sx={{ height: 40, marginLeft: 2 }}
          >
            Filtrar
          </Button>
        </div>

        <div sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer
            onScroll={handleScroll}
            sx={{ maxHeight: `calc(100vh - 160px)` }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Nome</TableCell>
                  <TableCell align="center">WhatsApp</TableCell>
                  <TableCell align="center">Data da conversa</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tickets.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell>
                      {<Avatar src={chat.contact.profilePicUrl} />}
                    </TableCell>
                    <TableCell>{chat.contact.name}</TableCell>
                    <TableCell align="center">{chat.contact.number}</TableCell>
                    <TableCell align="center">
                      {dayjs(chat.updatedAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell align="center">
                      {handleStatusLabel(chat.status)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigate(`/tickets/${chat.id}`);
                        }}
                      >
                        <WhatsappLogo size={24} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton avatar columns={3} />}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div> */}
    </>
  );
};

export default Search;
