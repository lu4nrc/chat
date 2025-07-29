import gracefulShutdown from "http-graceful-shutdown";
import { createServer } from "http";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

const httpServer = createServer(app);

// Inicializa Socket.IO
initIO(httpServer);

// Inicia Express + WebSocket
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

// Inicia sessões WhatsApp
StartAllWhatsAppsSessions();

// Graceful shutdown
gracefulShutdown(httpServer);
