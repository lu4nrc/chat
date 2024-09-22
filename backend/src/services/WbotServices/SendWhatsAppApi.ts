import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";

import formatBody from "../../helpers/Mustache";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
interface Request {
  media?: Express.Multer.File;
  contact: Contact;
  body?: string;
}

export const SendWhatsAppApiMedia = async ({
  media,
  contact
}: Request): Promise<void> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp();
    const wbot = getWbot(defaultWhatsapp.id);
    const newMedia = MessageMedia.fromFilePath(media!.path);
    await wbot.sendMessage(
      `${contact.number}@${contact.isGroup ? "g" : "c"}.us`,
      newMedia,
      {
        sendAudioAsVoice: true
      }
    );
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export const SendWhatsAppApiMessage = async ({
  contact,
  body
}: Request): Promise<void> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp();
    const wbot = getWbot(defaultWhatsapp.id);
    var hasBody = formatBody(body as string, contact);
    await wbot.sendMessage(
      `${contact.number}@${contact.isGroup ? "g" : "c"}.us`,
      hasBody,
      {
        sendAudioAsVoice: true
      }
    );
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};
