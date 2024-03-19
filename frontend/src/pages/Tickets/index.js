import React from "react";
import { useParams } from "react-router-dom";

import Ticket from "../../components/Ticket/";
import TicketsManager from "../../components/TicketsManager/";

import { Box, Grid, Stack, Typography, useTheme } from "@mui/material";

const Chat = () => {
  const theme = useTheme();
  const { ticketId } = useParams();

  return (
    <Grid container height={"100vh"}>
      <Grid item xs={12} sm="auto" >
        <TicketsManager />
      </Grid>
      <Grid
        item
        xs={12}
        sm
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.default,
        }}
      >
        {ticketId ? (
          <>
            <Ticket />
          </>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={"100%"}
          >
            <Typography variant="h4" fontWeight={"light"} align="center">
              Pronto para uma atendimento incrível?<br></br>{" "}
              <strong>Escolha um para começar!</strong>{" "}
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default Chat;
