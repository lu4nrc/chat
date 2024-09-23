import React, { useState, useCallback, useContext } from "react";

import { format, parseISO } from "date-fns";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Check, QrCode, Signal, SignalLow, Trash, Unplug } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import QueueSelect from "@/components/QueueSelect";
import { useToast } from "@/hooks/use-toast";

const CustomToolTip = ({ title, content, children }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost">{children}</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
        {content && <h2>{content}</h2>}
      </TooltipContent>
    </Tooltip>
  );
};

const Connections = () => {
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { toast } = useToast()

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
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
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
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast({
          variant: "success",
          title: "Sucesso!",
          description: i18n.t("connections.toasts.deleted"),
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <QrcodeModal
            open={qrModalOpen}
            onClose={setQrModalOpen}
            whatsAppId={whatsApp.id}
          />
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => handleStartWhatsAppSession(whatsApp.id)}
            >
              {i18n.t("connections.buttons.tryAgain")}
            </Button>
            <Button
              size="sm"
              onClick={() => handleRequestNewQrCode(whatsApp.id)}
            >
              {i18n.t("connections.buttons.newQr")}
            </Button>
          </div>
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              handleOpenConfirmationModal("disconnect", whatsApp.id);
            }}
          >
            {i18n.t("connections.buttons.disconnect")}
          </Button>
        )}
        {whatsApp.status === "OPENING" && (
          <Button onClick={() => handleRequestNewQrCode(whatsApp.id)}>
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <Unplug className="h-5 w-5 text-red-400" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && <span>Tentando reconectar..</span>}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <QrCode />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <Signal className="h-5 w-5 text-emerald-500" />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalLow />
          </CustomToolTip>
        )}
      </div>
    );
  };

  return (
    <div className="p-5 flex flex-col gap-5 h-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-2">
            <CardTitle>{i18n.t("connections.title")}</CardTitle>
            <CardDescription className="">
              Para que os dispositivos permaneçam conectados à sua conta, é
              necessário acessar o WhatsApp no seu celular principal a cada 14
              dias. Para uma melhor experiência, atualize para a versão mais
              recente do WhatsApp.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <WhatsAppModal />
        </CardContent>
      </Card>
      <Card className=" h-full">
        <CardContent>
          <Table>
            <TableCaption>Lista de WhatsApp adicionados.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{i18n.t("connections.table.name")}</TableHead>
                <TableHead>{i18n.t("connections.table.status")}</TableHead>
                <TableHead>{i18n.t("connections.table.session")}</TableHead>
                <TableHead>{i18n.t("connections.table.lastUpdate")}</TableHead>
                <TableHead>{i18n.t("connections.table.default")}</TableHead>
                <TableHead>{i18n.t("connections.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  {whatsApps?.length > 0 &&
                    whatsApps.map((whatsApp) => (
                      <TableRow key={whatsApp.id}>
                        <TableCell>{whatsApp.name}</TableCell>
                        <TableCell>{renderStatusToolTips(whatsApp)}</TableCell>
                        <TableCell>{renderActionButtons(whatsApp)}</TableCell>
                        <TableCell>
                          {format(
                            parseISO(whatsApp.updatedAt),
                            "dd/MM/yy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          {whatsApp.isDefault && (
                            <div>
                              <Check />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="flex items-center justify-center gap-1">
                          <WhatsAppModal isEdit whatsAppId={whatsApp.id} />
                          {/* //!Depois arrumar essa cagada!! ComfirmationModal */}
                          <div
                            className="flex justify-center items-center"
                            onClick={(e) =>
                              handleOpenConfirmationModal("delete", whatsApp.id)
                            }
                          >
                            <ConfirmationModal
                              title={confirmModalInfo.title}
                              message={confirmModalInfo.message}
                              btn_title={<Trash />}
                              onConfirm={handleSubmitConfirmationModal}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connections;
