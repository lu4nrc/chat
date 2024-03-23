import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Check } from "@mui/icons-material";
import { Divider, IconButton, Stack, Box } from "@mui/material";
import { ArrowCounterClockwise, CaretDown } from "@phosphor-icons/react";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import TicketOptionsMenu from "../TicketOptionsMenu";

const TicketActionButtons = ({ ticket }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const ticketOptionsMenuOpen = Boolean(anchorEl);
  const { user } = useContext(AuthContext);

  const handleOpenTicketOptionsMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseTicketOptionsMenu = () => {
    setAnchorEl(null);
  };

  const handleUpdateTicketStatus = async (status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      setLoading(false);
      if (status === "open") {
        navigate(`/tickets/${ticket.id}`);
      } else {
        navigate("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <div /* className={classes.actionButtons} */>
      {ticket.status === "open" && (
        <>
          <Stack direction={"row"} alignItems={"center"} spacing={2}>
            {/* <Box sx={{ display: { xs: "none", md: "block" } }}> */}
              <IconButton
                onClick={() => handleUpdateTicketStatus("pending", null)}
              >
                <ArrowCounterClockwise />
              </IconButton>
              <IconButton
                onClick={() => handleUpdateTicketStatus("closed", user?.id)}
              >
                <Check />
              </IconButton>
            {/* </Box> */}
            <Divider orientation="vertical" flexItem />
            <IconButton onClick={handleOpenTicketOptionsMenu}>
              <CaretDown />
            </IconButton>
          </Stack>
          {/*           <ButtonWithSpinner
            loading={loading}
            startIcon={<Replay />}
            size="small"
            onClick={() => handleUpdateTicketStatus("pending", null)}
          >
            <div>{i18n.t("messagesList.header.buttons.return")}</div>
          </ButtonWithSpinner>
          <ButtonWithSpinner
            loading={loading}
            startIcon={<Check />}
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleUpdateTicketStatus("closed", user?.id)}
          >
            <div >
              {i18n.t("messagesList.header.buttons.resolve")}
            </div>
          </ButtonWithSpinner>
          <IconButton
            onClick={handleOpenTicketOptionsMenu}
           
          >
            <MoreVert />
          </IconButton> */}
          <TicketOptionsMenu
            ticket={ticket}
            anchorEl={anchorEl}
            menuOpen={ticketOptionsMenuOpen}
            handleClose={handleCloseTicketOptionsMenu}
          />
        </>
      )}
      {ticket.status === "pending" && (
        <ButtonWithSpinner
          loading={loading}
          onClick={() => handleUpdateTicketStatus("open", user?.id)}
        >
          <div>Iniciar Atendimento</div>
        </ButtonWithSpinner>
      )}
    </div>
  );
};

export default TicketActionButtons;
