
import { Op } from "sequelize";
import Ticket from "../../models/Ticket";

interface Request {

}

interface Response {
  countTickets: number;
  espera: number;
  atendimento: number;
  finalizado: number;
}

const ListTicketsServiceToday = async ({

}: Request): Promise<Response> => {
  let conditions = {};

  const dateInitial = new Date().setHours(0, 0, 0, 0);
  const dateFinal = new Date();
  if (dateInitial
    && dateFinal) {

    var createdAt = {
      [Op.and]: {
        [Op.gte]: dateInitial,
        [Op.lte]: dateFinal
      }
    }
    conditions = {
      ...conditions,
      createdAt
    }
  }
  const { count: countTickets, rows: tickets } = await Ticket.findAndCountAll({

    where: conditions
  });

  var statusBy = [0, 0, 0]
  tickets.map((t) => {
    if (t.status === "pending") {
      statusBy[0] = statusBy[0] + 1
    }
    if (t.status === "open") {
      statusBy[1] = statusBy[1] + 1
    }
    if (t.status === "closed") {
      statusBy[2] = statusBy[2] + 1
    }

  })

  return {
    countTickets,
    espera: statusBy[0],
    atendimento: statusBy[1],
    finalizado: statusBy[2],

  };
};

export default ListTicketsServiceToday;
