import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import cron from "node-cron";
import NotificationScheduledService from "./services/ScheduleService/NotificationScheduledService";
import StatusUpdateScheduledService from "./services/ScheduleService/StatusUpdateScheduledService";
const server = app.listen(process.env.PORT, () => {
  logger.info(`Server started on port: ${process.env.PORT}`);
  cron.schedule("*/1 * * * *", () => {
    NotificationScheduledService();
    StatusUpdateScheduledService();

  });
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
