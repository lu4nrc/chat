import React, { useContext, useState } from "react";

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import ScheduleModal from "../ScheduleModal/index";

import { Box, Stack } from "@mui/material";
import Chip from "@mui/material/Chip";
import { AuthContext } from "../../context/Auth/AuthContext";

const ScheduledDetailsModal = ({
  handleClose,
  openStatus,
  value,
  callback,
  openCancelModal,
}) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 512,
    borderRadius: 1,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 2,
  };

  const localeValidation =
    /^(http|https):\/\/[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

  const [scheduleModal, setScheduleModal] = useState(false);
  const [, setScheduled] = useState({});
  const { user } = useContext(AuthContext);
  const handleCloseModal = () => {
    handleClose();
  };
  const handleOpenScheduleModal = () => {
    setScheduled(value);
    handleClose();
    setScheduleModal(true);
  };
  const handleClosedScheduleModal = () => {
    setScheduleModal(false);
  };

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
    <div>
      <Modal
        open={openStatus}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack spacing={1}>
            <Typography variant="h3" align="center">
              <strong>Detalhamento</strong>
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body1">
                <strong>Título:</strong> {value?.title}
              </Typography>

              <Typography variant="body1">
                <strong>Anfitrião:</strong> {value?.anfitriao?.name}
              </Typography>

              <Typography variant="body1">
                <strong>Criador do evento:</strong>{" "}
                {value?.user?.name || "User"}
              </Typography>

              <Typography variant="body1">
                <strong>Data:</strong> <strong>Início:</strong>
                {parseInitialDate(new Date(value.startDate))}{" "}
                <strong>Finalização: </strong>
                {parseEndDate(new Date(value.endDate))}
              </Typography>

              <Typography variant="body1">
                <strong>
                  {localeValidation.test(value) ? "Link" : "Local"}:
                </strong>{" "}
                {value?.locale}
              </Typography>

              {/*            <Typography variant="body1" style={{ marginRight: 10 }}>
                <strong>Recorrência:</strong>{" "}
                {value?.recorrency === 1
                  ? "Apenas uma vez"
                  : value.recorrency === 2
                  ? "Semanalmente"
                  : "Mensalmente"}
              </Typography>
              <Typography variant="body1">
                <strong>Prioridade:</strong>{" "}
                {value.level === 1
                  ? "Baixa"
                  : value.level === 2
                  ? "Média"
                  : "Alta"}
              </Typography>
           
            
              <Typography variant="body1">
                <strong>{value?.typeEvent === 1 ? "Local" : "Online"}:</strong>{" "}
                {value?.locale}
              </Typography> */}

              <Typography variant="body1">
                <strong>Descrição:</strong> {value?.description}
              </Typography>

              <Stack>
                <Typography variant="body1">
                  <strong>Participantes:</strong>
                </Typography>
                <Stack direction={"row"} spacing={0.7}>
                  {value?.externals
                    ? value.externals.map((e) => (
                        <Chip label={e.name} key={e.id} />
                      ))
                    : null}

                  {value?.attendants
                    ? value?.attendants.map((e) => (
                        <Chip label={e.name} key={e.id} />
                      ))
                    : null}
                </Stack>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="body1">
                  <strong>Notificação:</strong>{" "}
                  {/*                 {value?.notificationType?.includes(1) ? " Whatsapp " : ""}
                {value?.notificationType?.includes(2) ? " Email " : ""}
 */}
                </Typography>
                <Stack direction={"row"} spacing={0.7}>
                  {value?.datesNotify
                    ? value.datesNotify.map((e, i) => (
                        <Chip label={parseInitialDate(new Date(e))} key={i} />
                      ))
                    : null}
                </Stack>
              </Stack>
            </Stack>
            {value?.user?.id === user?.id ||
            value?.anfitriao?.id === user.id ? (
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleCloseModal();
                    openCancelModal(value.id);
                  }}
                >
                  Cancelar Agendamento
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleOpenScheduleModal()}
                >
                  Editar agendamento
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Modal>
      <ScheduleModal
        openStatus={scheduleModal}
        handleClose={handleClosedScheduleModal}
        scheduled={value}
        callback={callback}
      />
    </div>
  );
};
export default ScheduledDetailsModal;
