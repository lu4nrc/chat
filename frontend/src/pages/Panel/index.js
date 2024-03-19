import React, { useContext } from "react";


import { AuthContext } from "../../context/Auth/AuthContext";

import { FiberManualRecord } from "@mui/icons-material";
import { Stack, Typography, useTheme } from "@mui/material";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import Clock from "react-live-clock";
import PanelList from "../../components/PanelList";
import UsersOnline from "../../components/UsersOnline";
import "./style.css";




const Panel = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const userQueueIds = user?.queues.map((q) => q.id);
  return (
    <Stack direction={"column"} p={2} spacing={2}>
      {/* Header */}
      <Stack direction={"row"} justifyContent={"space-between"} px={2}>
        <Typography variant="h5">Painel</Typography>
        <Typography variant="h5">
          Horário de Brasília:{" "}
          <Clock format="HH:mm:ss" interval={1000} ticking={true} />
        </Typography>
      </Stack>
{/* Header */}
      <Stack direction={"row"} spacing={3} justifyContent={"space-between"}>
        <Stack spacing={1} flex={1}>
          <Stack>
            <Typography variant="h6">Atendimentos pendentes</Typography>
            <Stack direction={"row"} alignItems={"center"}>
              <FiberManualRecord style={{ fontSize: 15, color: "#f44336" }} />
              <Typography color={theme.palette.text.disabled} variant="caption">
                Mais de 15 minutos
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            bgcolor={theme.palette.background.neutral}
            p={1}
            sx={{ borderRadius: 1 }}
          >
            <Typography
              fontWeight={"bold"}
              variant="body1"
              color="textSecondary"
            >
              Chamado
            </Typography>
            <Typography
              fontWeight={"bold"}
              variant="body1"
              color="textSecondary"
              align="right"
            >
              Tempo
            </Typography>
          </Stack>

          <PanelList
            status="pending"
            showAll={true}
            selectedQueueIds={userQueueIds}
          />
        </Stack>

        <Stack spacing={1} flex={1}>
          <Stack>
            <Typography variant="h6">Em atendimento</Typography>
            <Stack direction={"row"} alignItems={"center"}>
              <FiberManualRecord style={{ fontSize: 15, color: "#f44336" }} />
              <Typography color={theme.palette.text.disabled} variant="caption">
                Mais de 15 minutos
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            bgcolor={theme.palette.background.neutral}
            p={1}
            sx={{ borderRadius: 1 }}
          >
            <Typography
              fontWeight={"bold"}
              variant="body1"
              color="textSecondary"
            >
              Chamado
            </Typography>
            <Typography
              fontWeight={"bold"}
              variant="body1"
              color="textSecondary"
              align="right"
            >
              Tempo
            </Typography>
          </Stack>

          <PanelList
            status="open"
            showAll={true}
            selectedQueueIds={userQueueIds}
          />
        </Stack>

        <Stack spacing={1} flex={1}>
          <Stack>
            <Typography variant="h6">Atendentes disponíveis</Typography>
            <Stack direction={"row"}>
              <Stack direction={"row"}>
                <FiberManualRecord
                  style={{ fontSize: 15, color: "#98E3C3", marginRight: 5 }}
                />
                <Typography color={theme.palette.text.disabled} variant="caption">Disponível</Typography>
              </Stack>
              <Stack direction={"row"}>
                <FiberManualRecord
                  style={{ fontSize: 15, color: "#FBED90", marginRight: 5 }}
                />
                <Typography color={theme.palette.text.disabled} variant="caption">Indisponível</Typography>
              </Stack>
              <Stack direction={"row"}>
                <FiberManualRecord
                  style={{ fontSize: 15, color: "#FB2A2A", marginRight: 5 }}
                />
                <Typography color={theme.palette.text.disabled} variant="caption">Offline</Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            bgcolor={theme.palette.background.neutral}
            p={1}
            sx={{ borderRadius: 1 }}
          >
            <Typography
              fontWeight={"bold"}
              variant="body1"
              color="textSecondary"
            >
              Atendentes
            </Typography>
            <Typography
              fontWeight={"bold"}
              variant="body1"
              color="textSecondary"
              align="right"
            >
              Status
            </Typography>
          </Stack>
          <UsersOnline />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Panel;
