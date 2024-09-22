import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
   // console.log({ locale: "StartWhatsAppSession.ts:", whatsapp: whatsapp?.dataValues.name });
    const wbot = await initWbot(whatsapp);
   // console.log({ locale: "StartWhatsAppSession.ts", wbot: wbot ? true : false, whatsapp: whatsapp?.dataValues.name });
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
  } catch (err: any) {
    console.error("An error occurred during wbot initialization:", err);
    logger.error(err);
  }
};
