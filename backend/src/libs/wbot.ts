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
  console.log({
    locale: "wbot.ts",
    fn: "syncUnreadMessages:",
    pushname: wbot.info.pushname
  });
  const chats = await wbot.getChats();
  console.log(
    "syncUnreadMessages:",
    chats.length > 1
      ? `Unread MSG > 0: ${wbot.info.pushname}`
      : `Unread MSG < 0: ${wbot.info.pushname}`
  );

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
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
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting WhatsApp bot initialization...");

      const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        console.log("initWbot", whatsapp.session);
        sessionCfg = JSON.parse(whatsapp.session);
      }

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: "bd_" + whatsapp.id }),
        restartOnAuthFail: true,
        qrMaxRetries: 4,
        webVersionCache: {
          type: "none"
        },
        puppeteer: {
          executablePath: process.env.CHROME_BIN || undefined,
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
          ],
          cacheEnabled: false, //!Testando desativar o cache para ver se diminui o uso
          // @ts-ignore
          browserWSEndpoint: process.env.CHROME_WS || undefined
        }
      });

      console.log("Initializing WhatsApp bot...");
      wbot.initialize();

      wbot.on("qr", async qr => {
        console.log("QR code received");
        logger.info("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("loading_screen", (percent, message) => {
        console.log("Loading screen:", percent, message);
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} Authenticated SUCCESSFULLY`);
      });

      wbot.on("auth_failure", async msg => {
        console.error(
          `Session: ${sessionName} AUTHENTICATION FAILURE! Reason: ${msg}`
        );

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session: ${sessionName} WhatsApp bot is READY`);

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0
        });

        logger.info(`STATUS: CONNECTED`);

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        wbot.sendPresenceAvailable();
        console.log("sendPresenceAvailable: OK");

        //TODO: O problema está aqui nesse infeliz!!
        // await syncUnreadMessages(wbot);

        console.log({
          locale: "wbot.ts",
          fn: "initWbot",
          sessionName: `${sessionName}`
        });
        resolve(wbot);
      });
    } catch (err) {
      console.error("Error during bot initialization:", err);
      logger.error(err);
      reject(err); // Ensure promise rejection on initialization error
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

export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};
