import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import ShowTicketService from "./ShowTicketService";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact,
  isScheduled?: boolean,
  rating?: number | null
): Promise<Ticket> => {
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

  ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
