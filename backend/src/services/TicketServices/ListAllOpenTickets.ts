import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import User from "../../models/User";

const ListAllOpenTickets = async (): Promise<Ticket[]> => {
  const tickets = await Ticket.findAll({
    where: {
      status: {
        [Op.notIn]: ["closed", "waitingRating"]
      }
    },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      },
      {
        model: User,
        as: "user",
        attributes: ["name"]
      }
    ],
    order: [["updatedAt", "DESC"]]
  });

  return tickets;
};

export default ListAllOpenTickets;