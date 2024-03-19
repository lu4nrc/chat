import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import Message from "../models/Message";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import { SendWhatsAppApiMessage, SendWhatsAppApiMedia} from "../services/WbotServices/SendWhatsAppApi";

type WhatsappData = {
  whatsappId: number;
}

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

interface ContactData {
  number: string;
}

const createContact = async (
  whatsappId: number | undefined,
  newContact: string
) => {
  await CheckIsValidContact(newContact);

  const validNumber: any = await CheckContactNumber(newContact);

  const profilePicUrl = await GetProfilePicUrl(validNumber);

  const number = validNumber;

  const contactData = {
    name: `${number}`,
    number,
    profilePicUrl,
    isGroup: false
  };

  const contact = await CreateOrUpdateContactService(contactData);
  return contact;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  var { body }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  if (newContact.number) {
    newContact.number = newContact.number.replace("-", "").replace(" ", "");
  }

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });
  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }
  const contactAndTicket = await createContact(whatsappId, newContact.number);

  if (medias && body) {

    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppApiMedia({ media, contact: contactAndTicket });
      })
    );
    await SendWhatsAppApiMessage({ body, contact: contactAndTicket });

  } else if (medias && !body) {

    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppApiMedia({ media, contact: contactAndTicket });
      })
    );

  } else if (body) {

    await SendWhatsAppApiMessage({ body, contact: contactAndTicket });

  } else {
    throw new AppError('NOT_DATA_FOUND')
  }

  return res.send();
};