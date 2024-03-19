import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Chip from "@mui/material/Chip";

import React, { useContext } from "react";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Stack } from "@mui/material";

const ScheduleItemCustom = ({
  openDetailsModal,
  openCancelModal,
  scheduled,
}) => {
  const { user } = useContext(AuthContext);

  const parseInitialDate = (date) => {
    var currentdate = date;
    var datetime =
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " " +
      currentdate.getHours() +
      ":" +
      `${
        currentdate.getMinutes() < 10
          ? "0" + currentdate.getMinutes()
          : currentdate.getMinutes()
      } `;
    return datetime;
  };

  const parseEndDate = (date) => {
    var currentdate = date;
    var datetime =
      currentdate.getHours() +
      ":" +
      `${
        currentdate.getMinutes() < 10
          ? "0" + currentdate.getMinutes()
          : currentdate.getMinutes()
      } `;
    return datetime;
  };

  return (
    <Stack
      direction={"column"}
      justifyContent={"space-between"}
      px={1.5}
      py={0.5}
      bgcolor={(theme) => theme.palette.background.neutral}
      borderRadius={1}
      border={"1px solid #E4E7EB"}
    >
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography
          onClick={() => openDetailsModal(scheduled)}
          component="span"
          variant="subtitle2"
        >
          {scheduled.title}
        </Typography>
        {scheduled?.user?.id === user?.id ||
        scheduled?.anfitriao?.id === user.id ? (
          <IconButton
            size="medium"
            variant="outlined"
            color="primary"
            style={{ padding: 0, margin: 0 }}
            onClick={() => openCancelModal(scheduled)}
          >
            <DeleteSweepIcon style={{ color: "#888E93" }} />
          </IconButton>
        ) : null}
      </Stack>
      <Stack onClick={() => openDetailsModal(scheduled)}>
        <Typography component="span" variant="caption">
          {parseInitialDate(new Date(scheduled.startDate))} -{" "}
          {parseEndDate(new Date(scheduled.endDate))}
        </Typography>
        <Typography component="span" variant="caption">
          <LocationOnIcon style={{ fontSize: 13 }} />
          {scheduled.locale}
        </Typography>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography component="span" variant="caption">
            Responsável: <strong>{scheduled?.anfitriao?.name}</strong>
          </Typography>
          <Chip
            label={scheduled.status === "open" ? "Pendente" : "Concluído"}
            size="small"
            style={
              scheduled.status === "open"
                ? { backgroundColor: "#0D99FF", color: "#fff" }
                : { backgroundColor: "#D4EADD", color: "#64A57B" }
            }
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ScheduleItemCustom;
