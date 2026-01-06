import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";

import {
  Contact as WbotContact,
  Message as WbotMessage,
  MessageAck,
  Client
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import CreateContactService from "../ContactServices/CreateContactService";
import formatBody from "../../helpers/Mustache";
import ShowOpenHours from "../SettingServices/ShowOpenHours";
import { getDay, isWithinInterval, setHours, setMinutes } from "date-fns";

interface Session extends Client {
  id?: number;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const DEBOUNCE_TIME_MS = 3000;

const writeFileAsync = promisify(writeFile);

const isBusinessHours = (OpeningHours: any): boolean => {
  const now = new Date();
  const dayOfWeek = getDay(now);
  const daySchedule = OpeningHours.days.find((d: any) => d.index === dayOfWeek);

  if (!daySchedule || !daySchedule.open) {
    return false;
  }

  // Cria um objeto Date a partir da string e extrai as horas e minutos
  const getHoursAndMinutes = (dateString: string) => {
    const dateObj = new Date(dateString);
    return {
      hour: dateObj.getHours(),
      minute: dateObj.getMinutes()
    };
  };

  const start1 = getHoursAndMinutes(daySchedule.start1);
  const end1 = getHoursAndMinutes(daySchedule.end1);

  let isWithinWorkingHours = false;

  // Verifica o primeiro intervalo
  const firstInterval = {
    start: setMinutes(setHours(now, start1.hour), start1.minute),
    end: setMinutes(setHours(now, end1.hour), end1.minute)
  };
  if (isWithinInterval(now, firstInterval)) {
    isWithinWorkingHours = true;
  }

  // Verifica o segundo intervalo (se houver)
  if (!isWithinWorkingHours && daySchedule.start2 && daySchedule.end2) {
    const start2 = getHoursAndMinutes(daySchedule.start2);
    const end2 = getHoursAndMinutes(daySchedule.end2);

    const secondInterval = {
      start: setMinutes(setHours(now, start2.hour), start2.minute),
      end: setMinutes(setHours(now, end2.hour), end2.minute)
    };

    if (isWithinInterval(now, secondInterval)) {
      isWithinWorkingHours = true;
    }
  }

  return isWithinWorkingHours;
};

const verifyContact = async (msgContact: WbotContact): Promise<Contact> => {
  const profilePicUrl = await msgContact.getProfilePicUrl();

  const contactData = {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    profilePicUrl,
    isGroup: msgContact.isGroup
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<Message | null> => {
  if (!msg.hasQuotedMsg) return null;

  const wbotQuotedMsg = await msg.getQuotedMessage();

  const quotedMsg = await Message.findOne({
    where: { id: wbotQuotedMsg.id.id }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

// Gera um ID de string aleatório para nomes de arquivo
function makeRandomId(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const updateTicketLastMessage = async (
  ticket: Ticket,
  msgBody: string
): Promise<void> => {
  await ticket.update({ lastMessage: msgBody });
};

const verifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const quotedMsg = await verifyQuotedMessage(msg);
  const fileSizeInBytes =
    msg.hasMedia && msg._data?.size ? msg._data.size : null;

  const isMemoryExceeded = fileSizeInBytes && fileSizeInBytes > MAX_FILE_SIZE;

  if (isMemoryExceeded) {
    const messageData = {
      id: msg.id.id,
      ticketId: ticket.id,
      contactId: msg.fromMe ? undefined : contact.id,
      body: msg.filename || msg.body,
      fromMe: msg.fromMe,
      read: msg.fromMe,
      mediaType: "exceededfile"
    };

    await updateTicketLastMessage(ticket, msg.body);
    const newMessage = await CreateMessageService({ messageData });

    return newMessage;
  }

  const media = await msg.downloadMedia();

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  let randomId = makeRandomId(5);

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${randomId}-${new Date().getTime()}.${ext}`;
  } else {
    const [fileName, fileExt] = media.filename.split(".");
    media.filename = `${fileName}.${randomId}.${fileExt}`;
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body || media.filename,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id
  };

  await updateTicketLastMessage(ticket, msg.body || media.filename);
  const newMessage = await CreateMessageService({ messageData });

  return newMessage;
};

const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  if (msg.type === "location") msg = prepareLocation(msg);

  const quotedMsg = await verifyQuotedMessage(msg);

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id
  };

  // Desativa temporariamente as verificações de ts devido ao bug de definição de tipo para o objeto Location
  // @ts-ignore
  const lastMessage =
    msg.type === "location"
      ? msg.location.description
        ? "Localization - " + msg.location.description.split("\\n")[0]
        : "Localization"
      : msg.body;

  await updateTicketLastMessage(ticket, lastMessage);
  await CreateMessageService({ messageData });
};

const prepareLocation = (msg: WbotMessage): WbotMessage => {
  let gmapsUrl =
    "https://maps.google.com/maps?q=" +
    msg.location.latitude +
    "%2C" +
    msg.location.longitude +
    "&z=17&hl=pt-BR";

  msg.body = "data:image/png;base64," + msg.body + "|" + gmapsUrl;

  // @ts-ignore
  msg.body +=
    "|" +
    (msg.location.description
      ? msg.location.description
      : msg.location.latitude + ", " + msg.location.longitude);

  return msg;
};

const verifyQueue = async (
  wbot: Session,
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage } = await ShowWhatsAppService(wbot.id!);

  if (queues.length === 1) {
    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id
    });
    return;
  }

  const selectedOption = msg.body;
  const choosenQueue = queues[+selectedOption - 1];

  if (choosenQueue) {
    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id },
      ticketId: ticket.id
    });

    const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, contact);
    const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, body);
    await verifyMessage(sentMessage, ticket, contact);
  } else {
    let options = "";
    queues.forEach((queue, index) => {
      options += `*${index + 1}* - ${queue.name}\n`;
    });

    const body = formatBody(`\u200e${greetingMessage}\n${options}`, contact);

    // Usa debounce para evitar o envio de múltiplas mensagens em sequência
    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@c.us`,
          body
        );
        verifyMessage(sentMessage, ticket, contact);
      },
      DEBOUNCE_TIME_MS,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast") return false;
  if (
    msg.type === "chat" ||
    msg.type === "audio" ||
    msg.type === "ptt" ||
    msg.type === "video" ||
    msg.type === "image" ||
    msg.type === "document" ||
    msg.type === "vcard" ||
    // msg.type === "multi_vcard" ||
    msg.type === "sticker" ||
    msg.type === "location"
  )
    return true;
  return false;
};

//! Tudo começa aqui!!
const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }
  // Ignora mensagens enviadas pelo próprio bot para evitar loops
  // if (msg.fromMe) {
  //   return;
  // }

  try {
    let msgContact: WbotContact;
    let groupContact: Contact | undefined;

    /* fromMe de Min */
    if (msg.fromMe) {
      if (msg.body.startsWith("> \u200B")) return;
      if (msg.body.startsWith("\u200e")) return;
      if (
        !msg.hasMedia &&
        msg.type !== "location" &&
        msg.type !== "chat" &&
        msg.type !== "vcard"
      ) {
        return;
      }
      msgContact = await wbot.getContactById(msg.to);
    } else {
      msgContact = await msg.getContact();
    }

    const chat = await msg.getChat();

    // Lógica para ignorar mensagens de grupo conforme solicitado.
    if (chat.isGroup) {
      return;
    }

    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;
    const isRating = /^[1-5]$/.test(msg.body);
    const rating = isRating ? +msg.body : null;

    // Executa as chamadas de forma paralela para melhor performance
    const [whatsapp, contact] = await Promise.all([
      ShowWhatsAppService(wbot.id!),
      verifyContact(msgContact)
    ]);

    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, contact) === msg.body
    ) {
      return;
    }

    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      groupContact,
      false,
      rating
    );

    //!Problemas com horário de funcionamento
    // const OpeningHours = await ShowOpenHours();

    // if (!isBusinessHours(OpeningHours)) {
    //   if (msg.fromMe) {
    //     return;
    //   }
    //   await msg.reply(
    //     `> \u200B Mensagem automática \n ${OpeningHours.message}`
    //   );
    // }

    if (ticket.rating) {
      msg.reply(
        "> \u200B Mensagem automática \nObrigado por avaliar o meu atendimento 😄."
      );
      ticket.update({ status: "closed" });
      return;
    }

    if (msg.hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    if (
      !ticket.queue &&
      !chat.isGroup &&
      !msg.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      await verifyQueue(wbot, msg, ticket, contact);
    }

    if (msg.type === "vcard") {
      try {
        const lines = msg.body.split("\n");

        let contact = "";
        const numbers = [];

        for (const line of lines) {
          // Nome
          if (line.startsWith("FN:")) {
            contact = line.replace("FN:", "").trim();
          }

          // Telefone
          if (line.startsWith("TEL")) {
            // tenta extrair waid
            const waidMatch = line.match(/waid=(\d+)/);

            if (waidMatch) {
              numbers.push(waidMatch[1]);
            } else {
              // fallback: número após :
              const numberPart = line.split(":")[1];
              if (numberPart) {
                numbers.push(numberPart.replace(/\D/g, ""));
              }
            }
          }
        }

        for (const number of numbers) {
          await CreateContactService({
            name: contact,
            number
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.id.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });
    if (!messageToUpdate) {
      return;
    }
    await messageToUpdate.update({ ack });

    io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
      action: "update",
      message: messageToUpdate
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const wbotMessageListener = (wbot: Session): void => {
  wbot.on("message_create", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    handleMsgAck(msg, ack);
  });
};

export { wbotMessageListener, handleMessage };
