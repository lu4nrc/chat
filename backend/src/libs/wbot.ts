import qrCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

const syncUnreadMessages = async (wbot: Session) => {
  const chats = await wbot.getChats();

  for (const chat of chats) {
    if (chat.unreadCount > 0) {
      const unreadMessages = await chat.fetchMessages({
        limit: chat.unreadCount
      });

      for (const msg of unreadMessages) {
        await handleMessage(msg, wbot);
      }

      await chat.sendSeen();
    }
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;

      // 🔁 Remove sessão antiga, se existir
      try {
        await removeWbot(whatsapp.id);
      } catch (e: any) {
        logger.warn(`Não foi possível limpar sessão antiga: ${e.message}`);
      }

      let sessionCfg;
      if (whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }
      const args: string = process.env.CHROME_ARGS || "";

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: `bd_${whatsapp.id}` }),
        puppeteer: {
          webVersionCache: {
            type: "remote",
            remotePath:
              "https://raw.githubusercontent.com/wppconnect-team/wa-version/refs/heads/main/html/2.3000.1031490220-alpha.html"
          },
          // 1. If a WebSocket URL is provided, use it. Otherwise, use local path.
          ...(process.env.CHROME_WS
            ? { browserWSEndpoint: process.env.CHROME_WS }
            : { executablePath: "/usr/bin/google-chrome-stable" }),
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process", // Added to help with the 'memlock' error
            "--disable-gpu",
            ...args.split(" ")
          ]
        }
      });

      wbot.initialize();

      wbot.on("qr", async qr => {
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        wbot.id = whatsapp.id;
        sessions.push(wbot);

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("loading_screen", (percent, message) => {
        logger.info(`Loading: ${percent}% - ${message}`);
      });

      wbot.on("authenticated", () => {
        logger.info(`Session: ${sessionName} authenticated`);
      });

      wbot.on("auth_failure", async msg => {
        logger.error(`Session ${sessionName} failed: ${msg}`);

        // 🧼 Limpa sessão e encerra Puppeteer
        try {
          await wbot.destroy();
        } catch (e) {
          logger.error("Erro ao destruir o wbot com falha de auth", e);
        }

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        await whatsapp.update({
          status: "DISCONNECTED",
          retries: whatsapp.retries + 1
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        reject(new Error("Erro ao iniciar sessão do WhatsApp."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session ${sessionName} is ready`);

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        wbot.id = whatsapp.id;
        sessions.push(wbot);

        wbot.sendPresenceAvailable();

        // Pode ativar novamente se necessário
        // await syncUnreadMessages(wbot);

        resolve(wbot);
      });
    } catch (err) {
      logger.error("Erro geral no initWbot:", err);
      reject(err);
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }

  return sessions[sessionIndex];
};

export const removeWbot = async (whatsappId: number): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      await sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error("Erro ao remover wbot:", err);
  }
};
