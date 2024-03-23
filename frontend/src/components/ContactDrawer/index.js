import CloseIcon from "@mui/icons-material/Close";
import { Backdrop, Divider, Stack, styled } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { AnimatePresence, m } from "framer-motion";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import ContactModal from "../ContactModal";
import ScheduleCancelModal from "../ScheduleCancelModal";
import ScheduledDetailsModal from "../ScheduleDetailsModal";
import ScheduleItemCustom from "../ScheduleItemCustom";
import ScheduleModal from "../ScheduleModal";
// @mui
import { alpha } from "@mui/material/styles";
// hooks
// utils
import cssStyles from "../../utils/cssStyles";
// config
import { Alarm, PencilSimple } from "@phosphor-icons/react";
import Tags from "./Tags";
//

const ContactDrawer = ({ open, handleDrawerClose, contact, loading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleCancelModal, setScheduleCancelModal] = useState(false);
  const [scheduleDetailsModal, setScheduleDetailsModal] = useState(false);
  const [scheduled, setScheduled] = useState({});
  const [scheduleds, setScheduleds] = useState([]);

  const [tel, setTel] = useState();

  /* const [tagOpen, setTagOpen] = useState(false); */
  const RootStyle = styled(m.div)(({ theme }) => ({
    ...cssStyles(theme).bgBlur({
      color: theme.palette.background.default,
      opacity: 0.92,
    }),
    top: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    position: "fixed",
    overflow: "hidden",
    width: 320,
    flexDirection: "column",
    margin: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    zIndex: theme.zIndex.drawer + 3,
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    boxShadow: `-24px 12px 32px -4px ${alpha(
      theme.palette.mode === "light"
        ? theme.palette.grey[500]
        : theme.palette.common.black,
      0.16
    )}`,
  }));

  const handleOpenScheduleModal = () => {
    setScheduleModal(true);
  };
  const handleClosedScheduleModal = () => {
    setScheduleModal(false);
  };
  const handleOpenScheduleCancelModal = (value) => {
    setScheduled(value);
    setScheduleCancelModal(true);
  };
  const handleClosedScheduleCancelModal = () => {
    setScheduleCancelModal(false);
  };
  const handleOpenScheduleDetailsModal = (value) => {
    setScheduled(value);
    setScheduleDetailsModal(true);
  };
  const handleClosedScheduleDetailsModal = () => {
    setScheduleDetailsModal(false);
  };
  const loadScheduleds = async () => {
    try {
      const result = await api.post("scheduleds/search", {
        number: contact.number,
      });
      setScheduleds(result.data);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const result = await api.post("scheduleds/search", {
          number: contact?.number,
        });
        setScheduleds(result.data);
      } catch (err) {
        toastError(err);
      }
    };
    if (contact.number) {
      loadInitial();
      const telNumber = formatPhoneNumber(contact.number);
      setTel(telNumber);
    }
  }, [contact.number]);

  const handleClose = handleDrawerClose;

  function formatPhoneNumber(phoneNumber) {
    // Remove todos os caracteres não numéricos
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");

    // Verifica se o número de telefone tem o tamanho correto
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    // Retorna o número original se não for possível formatar
    return phoneNumber;
  }

  return (
    <>
      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{
          background: "transparent",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      />

      <AnimatePresence>
        {open && (
          <>
            <RootStyle>
              {loading ? (
                <ContactDrawerSkeleton />
              ) : (
                <Stack>
                  <Stack
                    sx={{ py: 2, pr: 1, pl: 2.5 }}
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Dados do contato
                    </Typography>
                    <IconButton onClick={handleDrawerClose}>
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ borderStyle: "dashed" }} />

                  <Stack p={1} spacing={1}>
                    <Stack direction={"row"} spacing={1}>
                      <Avatar
                        alt={contact.name}
                        src={contact.profilePicUrl}
                        sx={{ width: 54, height: 54 }}
                      ></Avatar>
                      <Stack justifyContent={"center"}>
                        <Typography variant="subtitle1" fontWeight={"bold"}>
                          {contact.name}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#888E93" }}
                        >
                          Telefone:
                          {tel}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={0.5}>
                      <Stack
                        bgcolor={(theme) => theme.palette.background.paper}
                        direction={"column"}
                        justifyContent={"space-between"}
                        alignItems="flex-start"
                        borderRadius={1}
                        py={1.0}
                        px={1.0}
                      >
                        <Typography
                          variant="subtitle1"
                          pb={1}
                          fontWeight="bold"
                        >
                          Tags
                        </Typography>

                        <Stack width="100%">
                          <Tags contact={contact} />
                        </Stack>
                      </Stack>
                    </Stack>

                    <Stack
                      bgcolor={(theme) => theme.palette.background.paper}
                      direction={"column"}
                      justifyContent={"space-between"}
                      borderRadius={1}
                      py={1.0}
                      px={1.0}
                    >
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        pb={1}
                      >
                        <Typography
                          variant="subtitle1"
                          pb={1}
                          fontWeight="bold"
                        >
                          Agendamentos
                        </Typography>
                        <IconButton
                          size="medium"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenScheduleModal()}
                        >
                          <Alarm />
                        </IconButton>
                      </Stack>

                      <List>
                        {scheduleds?.map((scheduled) => (
                          <ScheduleItemCustom
                            openCancelModal={handleOpenScheduleCancelModal}
                            openDetailsModal={handleOpenScheduleDetailsModal}
                            scheduled={scheduled}
                            key={scheduled.id}
                          />
                        ))}
                      </List>
                    </Stack>

                    <Stack>
                      <Stack
                        bgcolor={(theme) => theme.palette.background.paper}
                        direction={"column"}
                        justifyContent={"space-between"}
                        alignItems="flex-start"
                        borderRadius={1}
                        py={1.0}
                        px={1.0}
                      >
                        <Stack
                          direction={"row"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          pb={1}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            Sobre
                          </Typography>
                          <IconButton
                            size="medium"
                            variant="outlined"
                            color="primary"
                            onClick={() => setModalOpen(true)}
                          >
                            <PencilSimple />
                          </IconButton>
                        </Stack>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#888E93" }}
                        >
                          Telefone:
                          <Link href={`tel:${contact.number}`}>
                            {contact.number}
                          </Link>
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#888E93" }}
                        >
                          Email: {contact.email}
                        </Typography>
                        {contact?.extraInfo?.map((info) => (
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#888E93" }}
                            key={info.id}
                          >
                            {info.name}:{info.value}
                          </Typography>
                        ))}
                      </Stack>
                    </Stack>
                  </Stack>

                  <ContactModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    contactId={contact.id}
                  ></ContactModal>
                </Stack>
              )}
              <ScheduleModal
                openStatus={scheduleModal}
                handleClose={handleClosedScheduleModal}
                callback={loadScheduleds}
              />

              <ScheduleCancelModal
                openStatus={scheduleCancelModal}
                handleClose={handleClosedScheduleCancelModal}
                value={scheduled.id}
                callback={loadScheduleds}
              />

              <ScheduledDetailsModal
                openStatus={scheduleDetailsModal}
                handleClose={handleClosedScheduleDetailsModal}
                value={scheduled}
                callback={loadScheduleds}
              />
            </RootStyle>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactDrawer;
