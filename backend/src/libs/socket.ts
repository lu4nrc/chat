import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { jwtDecode } from "jwt-decode";
import UpdateStatusUserService from "../services/UserServices/UpdateStatusUserService";

let io: SocketIO;
export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  const users: any = {};

  interface DecodedProps {
    usarname: string;
    profile: string;
    id: number;
    iat: number;
    exp: number;
  }

  io.on("connection", socket => {
    const token = socket.handshake.query.token;

    if (token && token !== "null") {
      const decoded: DecodedProps = jwtDecode(token as string);

      try {

        const userExists = Object.values(users).some(
          user => user.id === decoded.id
        );

        users[socket.id] = { id: decoded.id, username: decoded.usarname };
        
        if (!userExists) {
          UpdateStatusUserService({
            userId: decoded.id,
            status: "active"
          }).catch(error => {
            logger.error(`Failed to update user status: ${error.message}`);
          });
        }

        logger.info(`Usuário conectado: ${decoded.usarname}`);
      } catch (error) {
        logger.error(`Error decoding token: ${error.message}`);
      }
    } else {
      logger.info(`Usuário conectado: sem TOKEN`);
    }

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
      logger.info(`Socket Desconencted`);

      if (users[socket.id]) {
        const userId = users[socket.id].id;
        delete users[socket.id];

      const userExists = Object.values(users).some(
          user => user.id === userId
        ); 

        if (!userExists) {
          UpdateStatusUserService({
            userId: userId,
            status: "inactive"
          }).catch(error => {
            logger.error(`Failed to update user status: ${error.message}`);
          });
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
