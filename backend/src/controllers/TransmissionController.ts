import { Request, Response } from "express";

import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import CreateTransmissionService from "../services/TransmissionService/CreateTransmissionService";
import DeleteTransmissionService from "../services/TransmissionService/DeleteTransmissionService";
import SendTransmissionService from "../services/TransmissionService/SendTransmissionService";
import ShowTransmissionService from "../services/TransmissionService/ShowTransmissionService";
import UpdateTransmissionService from "../services/TransmissionService/UpdateTransmissionService";
interface Message {
  type: string;
  value: string;
  date: Date;
}
interface ContactTransmission {
  name: string;
  number: string;
  email: string;
  isGroup: boolean;
  id: number;
}
type MessageData = {
  name: string;
  allContacts: string;
  contacts: string;
  msgs: string;
  oldmsgs: string;
};
export const show = async (req: Request, res: Response): Promise<Response> => {
  var transmissions = await ShowTransmissionService();
  return res.status(200).json(transmissions);
};
export const store = async (req: Request, res: Response) => {
  var { allContacts, contacts, msgs, name }: MessageData = req.body;
  var messages = JSON.parse(msgs) as Message[];
  var contactsSelected = Array();
  const medias = req.files as Express.Multer.File[];
  messages.forEach((msg) => {
    if (msg.type === "img") {
      medias.map((media) => {
        if (media.originalname === msg.value) {
          msg.value = media.path;
        }
      });
    }
  });
  if (JSON.parse(allContacts)) {
    var all = await Contact.findAll();
    contactsSelected = all.map((contact) => {
      return {
        name: contact.name,
        number: contact.number,
        email: contact.email,
        isGroup: contact.isGroup,
        id: contact.id,
      };
    });
  } else {
    contactsSelected = JSON.parse(contacts) as ContactTransmission[];
  }
  try {
    await CreateTransmissionService({
      name,
      contacts: contactsSelected,
      messages,
    });
    return res.status(200).json({});
  } catch (e:any) {
    throw new AppError(`${e.message}`);
  }
};
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  await DeleteTransmissionService({ id: parseInt(req.params.id) });
  return res.status(200).json({});
};
export const send = async (req: Request, res: Response): Promise<Response> => {
  var contactsErr = await SendTransmissionService({
    id: parseInt(req.params.id),
  });
  return res.status(200).json({ contactsErr: contactsErr });
};

export const update = async (req: Request, res: Response) => {
  var { id } = req.params;
  var { allContacts, contacts, msgs, name }: MessageData = req.body;
  var messages = JSON.parse(msgs) as Message[];
  var contactsSelected = Array();
  const medias = req.files as Express.Multer.File[];
  messages.forEach((msg) => {
    if (msg.type === "img") {
      medias.map((media) => {
        if (media.originalname === msg.value) {
          msg.value = media.path;
        }
      });
    }
  });
  if (JSON.parse(allContacts)) {
    var all = await Contact.findAll();
    contactsSelected = all.map((contact) => {
      return {
        name: contact.name,
        number: contact.number,
        email: contact.email,
        isGroup: contact.isGroup,
        id: contact.id,
      };
    });
  } else {
    contactsSelected = JSON.parse(contacts) as ContactTransmission[];
  }
  try {
    await UpdateTransmissionService({
      id: parseInt(id),
      name,
      contacts: contactsSelected,
      messages,
    });
    return res.status(200).json({});
  } catch (e:any) {
    throw new AppError(`${e.message}`);
  }
};
