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
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "waitingRating"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId: whatsappId
    }
  });
  var durationDate = new Date();
  if (ticket?.status === "open") {
    await ticket.update({ unreadMessages });
  }

  if (ticket?.status === "pending") {
    await ticket.update({ unreadMessages });
  }

  /* if (rating && ticket?.status === "waitingRating") {
    await ticket.update({ rating });
  } */

 /*  if (!rating && ticket?.status === "waitingRating") {
    await ticket.update({ status: "closed" });
    ticket = null;
  } */

  // if (!ticket && groupContact) {

  //   ticket = await Ticket.findOne({
  //     where: {
  //       contactId: groupContact.id,
  //       whatsappId: whatsappId
  //     },
  //     order: [["updatedAt", "DESC"]]
  //   });

  //   if (ticket) {
  //     await ticket.update({
  //       status: "pending",
  //       userId: null,
  //       unreadMessages,
  //       durationDate: durationDate,
  //       initialDate: new Date(),
  //       acceptDate: new Date(),
  //       finishDate: new Date(),
  //     });
  //   }
  // }

  // if (!ticket && !groupContact) {
  //   ticket = await Ticket.findOne({
  //     where: {
  //       updatedAt: {
  //         [Op.between]: [+subHours(new Date(), 2), +new Date()]
  //       },
  //       contactId: contact.id,
  //       whatsappId: whatsappId
  //     },
  //     order: [["updatedAt", "DESC"]]
  //   });

  //   if (ticket) {
  //     await ticket.update({
  //       status: "pending",
  //       userId: null,
  //       unreadMessages, durationDate: durationDate
  //     });
  //   }
  // }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: isScheduled ? "closed" : "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      durationDate: durationDate,
      initialDate: new Date(),
      acceptDate: new Date(),
      finishDate: new Date()
    });
  }

  ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
