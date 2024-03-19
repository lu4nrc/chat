import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Transmission from "../../models/Transmission";
import { MessageMedia } from "whatsapp-web-hellow.js";
import formatBody from "../../helpers/Mustache";
import { sleep, findSeries } from "modern-async";
var path = require("path");
var absolutePath = path.resolve("./public");
interface Request {
  id: number;
}

interface ContactCustom {
  name: string;
  number: string;
  email: string;
  isGroup: boolean;
  id: number;
}
const SendTransmissionService = async ({
  id,
}: Request): Promise<Array<any>> => {
  var contactsErr;
  const sendMessage = async (
    contact: ContactCustom,
    data: MessageMedia | any
  ) => {
    try {
      await wbot.sendMessage(
        `${contact.number}@${contact.isGroup ? "g" : "c"}.us`,
        data,
        {
          wbotType: "transmission",
        }
      );
    } catch (e:any) {
      contactsErr.push(` ${contact.name}`);
    }
  };

  var transmission = await Transmission.findOne({
    where: {
      id: id,
    },
  });
  const defaultWhatsapp = await GetDefaultWhatsApp();
  const wbot = getWbot(defaultWhatsapp.id);
  await findSeries(
    transmission?.contacts || [],
    async (contact, contactIndex) => {
      await findSeries(transmission?.messages || [], async (msg, msgIndex) => {
        var data;
        if (msg.type === "img") {
          data = MessageMedia.fromFilePath(msg.value);
        } else {
          data = formatBody(msg.value, contact as Contact);
        }
        await sendMessage(contact, data);
        if (transmission?.messages.length === msgIndex) {
          return true;
        } else {
          return false;
        }
      });
      if (contactIndex === transmission?.contacts.length!) {
        return true;
      } else {
        return false;
      }
    }
  );
  return contactsErr ?? [];
};

export default SendTransmissionService;
