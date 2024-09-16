import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const { toast } = useToast()
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        const errorMsg =
        err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const socket = openSocket();

    socket.on("whatsappSession", (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Qr Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{i18n.t("qrCode.message")}</DialogTitle>
          <DialogDescription>
            Abra o WhatsApp, Use seu celular principal para
            escanear o QR code exibido na tela do computador.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 justify-center">
            <span className="text-sm">
              Abra o WhatsApp no seu celular Android principal e, em seguida,
              toque em Mais opções more options icon Dispositivos conectados.
            </span>
            <span className="text-sm">
              Toque em <b>Conectar dispositivo</b>
            </span>
            <span className="text-sm">
              Desbloqueie seu celular Android: Se a autenticação biométrica
              estiver ativada, siga as instruções exibidas na tela. Se a
              autenticação biométrica não estiver ativada, será necessário
              informar o <b>PIN</b> usado para desbloquear o celular.
            </span>
            <span className="text-sm">
              Aponte seu celular Android para a tela do dispositivo que você
              deseja conectar para escanear o <b>QR code</b>.
            </span>
          </div>
          {qrCode ? (
            <QRCode value={qrCode} size={256} />
          ) : (
            <span>Waiting for QR Code</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
