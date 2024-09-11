import { format, parseISO } from "date-fns";
import React, { useCallback, useContext, useState } from "react";
import { toast } from "react-toastify";

import { CropFree } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import {
  CellSignalFull,
  CellSignalX,
  CheckCircle,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import WhatsAppModal from "../../components/WhatsAppModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const CustomToolTip = ({ title, content, children }) => {
  const theme = useTheme();
  return (
    <Tooltip
      arrow
      title={
        <React.Fragment>
          <Typography gutterBottom color={theme.palette.primary.main}>
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const Connections = () => {
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"), {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        });
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <Button onClick={() => handleOpenQrModal(whatsApp)}>Conectar</Button>
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleStartWhatsAppSession(whatsApp.id)}
            >
              {i18n.t("connections.buttons.tryAgain")}
            </Button>{" "}
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleRequestNewQrCode(whatsApp.id)}
            >
              {i18n.t("connections.buttons.newQr")}
            </Button>
          </>
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Button
            onClick={() => {
              handleOpenConfirmationModal("disconnect", whatsApp.id);
            }}
          >
            {i18n.t("connections.buttons.disconnect")}
          </Button>
        )}
        {whatsApp.status === "OPENING" && <Button>Conectando...</Button>}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={"classes.customTableCell"}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <CellSignalX size={24} color="#FF0000" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={"classes.buttonProgress"} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <CellSignalFull size={24} color="#229A16" />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <CellSignalX size={24} color="#FF0000" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  return (
    <Stack p={2} spacing={2}>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography variant="h5">Conexão</Typography>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" onClick={handleOpenWhatsAppModal}>
            Adicionar
          </Button>
        </MainHeaderButtonsWrapper>
      </Stack>
      <Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("connections.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("connections.table.status")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("connections.table.session")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("connections.table.lastUpdate")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("connections.table.default")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("connections.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton />
            ) : (
              <>
                {whatsApps?.length > 0 &&
                  whatsApps.map((whatsApp) => (
                    <TableRow key={whatsApp.id}>
                      <TableCell align="center">{whatsApp.name}</TableCell>
                      <TableCell align="center">
                        {renderStatusToolTips(whatsApp)}
                      </TableCell>
                      <TableCell align="center">
                        {renderActionButtons(whatsApp)}
                      </TableCell>
                      <TableCell align="center">
                        {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell align="center">
                        {whatsApp.isDefault && (
                          <div className={""}>
                            <CheckCircle size={24} color="#229A16" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditWhatsApp(whatsApp)}
                        >
                          <PencilSimple size={24} />
                        </IconButton>

                        <IconButton
                          onClick={(e) => {
                            handleOpenConfirmationModal("delete", whatsApp.id);
                          }}
                        >
                          <Trash />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
      </Stack>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      <QrcodeModal
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
      />
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />
    </Stack>
  );
};

export default Connections;
