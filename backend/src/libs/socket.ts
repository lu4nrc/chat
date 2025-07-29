// src/libs/socket.ts
import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";

import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import authConfig from "../config/auth";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware de autenticação antes da conexão
  io.use((socket, next) => {
    const token = socket.handshake.query.token as string;

    try {
      const decoded = verify(token, authConfig.secret);
      socket.data.tokenData = decoded;
      next();
    } catch (err) {
      logger.error("Socket auth failed:", err);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", socket => {
    const { tokenData } = socket.data;
    logger.debug(tokenData, "Socket.IO connected");

    socket.on("joinChatBox", (ticketId: string) => socket.join(ticketId));
    socket.on("joinNotification", () => socket.join("notification"));
    socket.on("joinTickets", (status: string) => socket.join(status));
    socket.on("disconnect", () => logger.debug("Socket.IO disconnected"));
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) throw new AppError("Socket.IO not initialized");
  return io;
};
