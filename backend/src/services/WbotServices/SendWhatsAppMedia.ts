import fs from "fs";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web-hellow.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import formatBody from "../../helpers/Mustache";
interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const hasBody = body
      ? formatBody(body as string, ticket.contact)
      : undefined;

    const newMedia = MessageMedia.fromFilePath(media.path);

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      newMedia,
      {
        sendAudioAsVoice: true,
        caption: hasBody
      }
    );
    await ticket.update({ lastMessage: body || media.filename });
    fs.unlinkSync(media.path);

    return sentMessage;
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_SENDING_WAPP_MSG_MEDIA");
  }
};

export default SendWhatsAppMedia;
