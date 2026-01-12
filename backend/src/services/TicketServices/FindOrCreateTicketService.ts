import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import ShowTicketService from "./ShowTicketService";
import Whatsapp from "../../models/Whatsapp";
import User from "../../models/User";
import Queue from "../../models/Queue";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact,
  isScheduled?: boolean,
  rating?: number | null
): Promise<Ticket | null> => {
  const durationDate = new Date();

  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "waitingRating"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId: whatsappId
    },
    attributes: ["id", "status", "createdAt", "unreadMessages"],
    order: [["createdAt", "DESC"]]
  });

  if (ticket?.status === "open" || ticket?.status === "pending") {
    if (ticket.unreadMessages !== unreadMessages) {
      await ticket.update({ unreadMessages });
    }
  }

  if (ticket?.status === "waitingRating") {
    if (rating) {
      await ticket.update({ rating });
      return ticket;
    } else {
      await ticket.update({ status: "closed" });
      ticket = null;
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: isScheduled ? "closed" : "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      durationDate: durationDate,
      initialDate: durationDate,
      acceptDate: durationDate,
      finishDate: durationDate
    });
  }

  ticket = await Ticket.findByPk(ticket.id, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      }
    ],
    attributes: [
      "id",
      "status",
      "createdAt",
      "unreadMessages",
      "queueId",
      "userId",
      "contactId",
      "rating",
      "lastMessage"
    ],
    order: [["createdAt", "DESC"]]
  });

  //ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
