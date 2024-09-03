import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import authConfig from "../config/auth";

let io: SocketIO;

// Objeto para rastrear o número de conexões por usuário
const userConnections: Record<number, number> = {};

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  io.on("connection", socket => {
    const { token } = socket.handshake.query;
    let tokenData = null;
    try {
      tokenData = verify(token, authConfig.secret);
      const userId = tokenData.id;

      logger.debug(JSON.stringify(tokenData), "io-onConnection: tokenData");
      logger.info(JSON.stringify(tokenData), "io-onConnection: tokenData");

      // Incrementa o contador de conexões para o usuário
      if (userConnections[userId]) {
        userConnections[userId]++;
      } else {
        userConnections[userId] = 1;
        // O usuário se conectou pela primeira vez, considerar como online
        io.emit("userOnline", userId);
      }
    } catch (error) {
      logger.error(JSON.stringify(error), "Error decoding token");
      socket.disconnect();
      return io;
    }

    logger.info("Client Connected");

    socket.on("joinChatBox", (ticketId: string) => {
      logger.info("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });

    socket.on("disconnect", () => {
      const userId = tokenData.id;

      logger.info("Client disconnected");

      // Decrementa o contador de conexões para o usuário
      if (userConnections[userId]) {
        userConnections[userId]--;
        if (userConnections[userId] === 0) {
          // Se o contador atingir 0, considerar o usuário como offline
          delete userConnections[userId];
          io.emit("userOffline", userId);
        }
      }
    });

    return socket;
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
