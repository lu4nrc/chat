import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { jwtDecode } from "jwt-decode";

let io: SocketIO;
export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  const users = new Map<string, { id: number; username: string }>();
  const emittedUsers = new Set<number>();

  interface DecodedProps {
    usarname: string;
    profile: string;
    id: number;
    iat: number;
    exp: number;
  }

  const emitOnlineUsers = () => {
    const onlineUsers = Array.from(users.values());
    io.emit("onlineUsers", onlineUsers);
    //console.log(users);
  };

  io.on("connection", socket => {
    const totalSockets = io.engine.clientsCount;
    const token = socket.handshake.query.token;

    if (token && token !== "null") {
      const decoded: DecodedProps = jwtDecode(token as string);

      try {
        if (!emittedUsers.has(decoded.id)) {
          users.set(socket.id, { id: decoded.id, username: decoded.usarname });
          emittedUsers.add(decoded.id);

          emitOnlineUsers();

          /*  logger.info(
            `Usuário conectado: ${decoded.usarname} - SOCKETS: ${totalSockets}`
          ); */
        }
      } catch (error) {
        logger.error(
          `Error decoding token: ${error.message} - SOCKETS: ${totalSockets}`
        );
      }
    } else {
      logger.info(`Usuário conectado: sem TOKEN - SOCKETS: ${totalSockets}`);
    }

    socket.on("joinChatBox", (ticketId: string) => {
      /*  logger.info(
        `A client joined a ticket channel - SOCKETS: ${totalSockets}`
      ); */
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      /*  logger.info(
        `A client joined notification channel - SOCKETS: ${totalSockets}`
      ); */
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      /*   logger.info(
        `A client joined to ${status} tickets channel - SOCKETS: ${totalSockets}`
      ); */
      socket.join(status);
    });

    socket.on("disconnect", () => {
      const totalSockets = io.engine.clientsCount;
      logger.info(`Socket Desconectado - SOCKETS: ${totalSockets}`);

      const user = users.get(socket.id);

      if (user) {
        users.delete(socket.id);

        const userStillConnected = Array.from(users.values()).some(
          u => u.id === user.id
        );

        if (!userStillConnected) {
          emittedUsers.delete(user.id);
          emitOnlineUsers();
        }
      }
    });
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
