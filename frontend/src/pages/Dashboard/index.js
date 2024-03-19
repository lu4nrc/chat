import React, { useCallback, useContext } from "react";

import { useEffect, useState } from "react";

import { CardContent, Stack, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField/TextField";
import BackdropLoading from "../../components/BackdropLoading";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
// import CategoryChart from "./categoryChart";
// import BarChart from "./barChart";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [userId, setUserId] = useState("");
  const [queueId, setQueueId] = useState("");
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  // const [openChats, setOpenTickets] = useState(0);
  // const [pendingChats, setPendingTickets] = useState(0);
  // const [closedChats, setClosedTickets] = useState(0);
  const [espera, setEspera] = useState(0);
  const [atendimento, setAtendimento] = useState(0);
  const [finalizado, setFinalizado] = useState(0);
  const [loading, setIsloading] = useState(false);
  const [data, setData] = useState([]);
  const theme = useTheme();
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());

  function converteMinutosParaHoras(minutos) {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    const horasStr = String(horas).padStart(2, "0");
    const minutosStr = String(minutosRestantes).padStart(2, "0");
    return `${horasStr}:${minutosStr}`;
  }

  function arredondaMinutos(minutos) {
    var minutosArredondados = Math.round(minutos * 10) / 10;
    minutosArredondados -= 0.05;
    if (minutosArredondados < 0) {
      minutosArredondados = 0;
    }
    return converteMinutosParaHoras(minutosArredondados.toFixed(0));
  }

  useEffect(() => {
    fetchTicketsGeneral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchTicketsGeneral = async () => {
    setIsloading(true);
    try {
      const { data } = await api.get("/tickets/general", {
        params: {
          dateInitial: date1 ? date1.toString() : null,
          dateFinal: date2 ? date2.toString() : null,
          userId: user.profile === "admin" ? userId : user.id,
          queue: queueId,
        },
      });
      setEspera(data.espera);
      setAtendimento(data.atendimento);
      setFinalizado(data.finalizado);
      // setOpenTickets(data.qtatendimento);
      // setPendingTickets(data.qtespera);
      // setClosedTickets(data.qtfinalizado);
      setData(data.chats);
    } catch (err) {
      toastError(err);
    }
    setIsloading(false);
  };

  const fetchInitialData = useCallback(() => {
    const fetch = async () => {
      try {
        const usersData = await api.get("/users");
        const queueData = await api.get("/queue");
        setUsers(usersData.data.users);
        setQueue(queueData.data);
      } catch (err) {
        toastError(err);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    setIsloading(true);
    if (user.profile === "admin") {
      fetchInitialData();
    }
    const fetch = async () => {
      try {
        const { data } = await api.get("/tickets/general", {
          params: {
            userId: user.profile === "admin" ? null : user.id,
          },
        });
        setEspera(data.espera);
        setAtendimento(data.atendimento);
        setFinalizado(data.finalizado);
        // setOpenTickets(data.qtatendimento);
        // setPendingTickets(data.qtespera);
        // setClosedTickets(data.qtfinalizado);
      } catch (err) {
        toastError(err);
      }
    };
    fetch();
    setIsloading(false);
  }, [fetchInitialData, user.id, user.profile]);

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <Stack spacing={2} padding={2} sx={{ height: "100vh", overflow: "auto" }}>
      <Typography variant="h5">Dashboard</Typography>

      <Stack spacing={2}>
        <Stack direction={"row"} spacing={2}>
          <Stack direction={"row"} spacing={2} flex={1}>
            <DatePicker
              defaultValue={dayjs(new Date())}
              value={dayjs(date1)}
              slotProps={{ textField: { size: "small" } }}
              onChange={(date) => setDate1(date)}
            />
            <DatePicker
              defaultValue={dayjs(new Date())}
              value={dayjs(date2)}
              onChange={(date) => setDate2(date)}
              slotProps={{ textField: { size: "small" } }}
            />

            <TextField
              sx={{ width: 200 }}
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
              sx={{ width: 200 }}
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
            <Button
              variant="contained"
              onClick={fetchTicketsGeneral}
              sx={{ height: 40 }}
            >
              Filtrar
            </Button>
          </Stack>
        </Stack>

        <Stack
          direction={"row"}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          justifyContent={"space-between"}
        >
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">{data.length}</Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Quantidade de chamados
              </Typography>
            </CardContent>
          </Stack>
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">{arredondaMinutos(espera)} </Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Tempo médio de espera
              </Typography>
            </CardContent>
          </Stack>
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">
                {arredondaMinutos(atendimento)}
              </Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Tempo médio de atendimento
              </Typography>
            </CardContent>
          </Stack>
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">
                {arredondaMinutos(finalizado)}{" "}
              </Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Tempo médio total
              </Typography>
            </CardContent>
          </Stack>
        </Stack>

        {/* <Stack
          direction={"row"}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          justifyContent={"space-between"}
        >
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">{openChats}</Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Chamados em aberto
              </Typography>
            </CardContent>
          </Stack>
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">{pendingChats} </Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Chamados em atendimento
              </Typography>
            </CardContent>
          </Stack>
          <Stack
            flex={1}
            bgcolor={theme.palette.background.paper}
            borderRadius={2}
            border={theme.palette.mode === "light" ? "1px solid #DFE3E8" : ""}
          >
            <CardContent>
              <Typography variant="h3">{closedChats}</Typography>
              <Typography color={theme.palette.text.disabled} variant="h6">
                Chamados finalizados
              </Typography>
            </CardContent>
          </Stack>
        </Stack> */}

        {/* <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid container>
            <Grid item xs={12} md={6} sm={6} p={2}>
              <CategoryChart chats={data} isLoading={loading} />
            </Grid>
            <Grid item xs={12} md={6} sm={6} p={2}>
              <BarChart chats={data} isLoading={loading} />
            </Grid>
          </Grid>
        </Stack> */}
      </Stack>
    </Stack>
  );
};

export default Dashboard;
