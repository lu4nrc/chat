import QRCode from "qrcode.react";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import openSocket from "../../services/socket-io";

import { Dialog, DialogContent, Stack, Typography } from "@mui/material";
import api from "../../services/api";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
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
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent>
        <Stack
          spacing={3}
          justifyContent={"center"}
          alignItems={"center"}
          maxWidth={720}
        >
          {qrCode ? (
            <QRCode value={qrCode} size={256} />
          ) : (
            <span>Aguardando QrCode</span>
          )}
          <Stack spacing={1}>
            <Typography variant="body2" color="text">
              <strong>Escaneie o código QR:</strong> Agora, abra o WhatsApp no
              seu smartphone e toque no ícone de três pontos no canto superior
              direito (no Android) ou no ícone "Configurações" na parte inferior
              da tela (no iPhone). Em seguida, selecione a opção "WhatsApp Web"
              ou "WhatsApp Web/Desktop".
            </Typography>
            <Typography variant="body2" color="text">
              <strong>Use o scanner de código QR do WhatsApp:</strong>O
              aplicativo WhatsApp abrirá a câmera. Aponte a câmera do seu
              celular para o código QR na tela do seu computador para
              escaneá-lo.
            </Typography>
            <Typography variant="body2" color="text">
              <strong>Aguarde a conexão:</strong> Após escanear o código QR com
              sucesso, o <strong>HellowChat</strong> deve se conectar
              automaticamente ao seu WhatsApp no smartphone. Você verá todas as
              suas conversas e poderá começar a enviar mensagens diretamente da
              plataforma.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
