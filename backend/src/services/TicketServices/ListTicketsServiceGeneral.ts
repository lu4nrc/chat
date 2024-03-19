import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import moment from "moment-timezone";
import User from "../../models/User";

interface Request {
  dateInitial?: string;
  dateFinal?: string;
  userId?: string;
  queue?: string;
}

interface Response {
  chats?: Ticket[];
  espera?: number;
  atendimento?: number;
  finalizado?: number;
  qtespera: number;
  qtatendimento: number;
  qtfinalizado: number;
}

const ListTicketsServiceGeneral = async ({
  dateInitial,
  dateFinal,
  userId,
  queue
}: Request): Promise<Response> => {
  let conditions = {};
  if (userId) {
    conditions = {
      ...conditions,
      userId: userId
    };
  }
  if (queue) {
    conditions = {
      ...conditions,
      queueId: queue
    };
  }
  if (dateInitial && dateFinal) {
    const initial = moment(dateInitial);
    const end = moment(dateFinal);
    var createdAt = {
      [Op.and]: {
        [Op.gte]: moment(
          new Date(initial.year(), initial.month(), initial.date(), 0, 0, 0)
        )
          .tz("America/Sao_Paulo")
          .format(),
        [Op.lte]: moment(
          new Date(end.year(), end.month(), end.date(), 23, 59, 59)
        )
          .tz("America/Sao_Paulo")
          .format()
      }
    };
    conditions = {
      ...conditions,
      createdAt
    };
  } else {
    const dateNow = moment();
    var createdAt = {
      [Op.and]: {
        [Op.gte]: moment(
          new Date(dateNow.year(), dateNow.month(), dateNow.date(), 0, 0, 0)
        )
          .tz("America/Sao_Paulo")
          .format(),
        [Op.lte]: moment(
          new Date(dateNow.year(), dateNow.month(), dateNow.date(), 23, 59, 59)
        )
          .tz("America/Sao_Paulo")
          .format()
      }
    };
    conditions = {
      ...conditions,
      createdAt
    };
  }

  conditions = {
    ...conditions,
    isGroup: { [Op.is]: false }
  };

  const { rows: chats } = await Ticket.findAndCountAll({
    where: conditions,
    include: ["contact", "queue", "user"]
  });

  var statusBy = [0, 0, 0];
  chats.map(ticket => {
    if (ticket.status === "pending") {
      statusBy[0] = statusBy[0] + 1;
    }
    if (ticket.status === "open") {
      statusBy[1] = statusBy[1] + 1;
    }
    if (ticket.status === "closed") {
      statusBy[2] = statusBy[2] + 1;
    }
  });

  var resultTotal = chats.map(t => {
    let initial = t.initialDate;
    let accept = t.acceptDate;
    let finish = t.finishDate;
    if (t.initialDate == null && t.finishDate == null && t.acceptDate == null) {
      return {
        tempodeespera: 0,
        tempodeatendimento: 0,
        tempodeatendimentototal: 0
      };
    } else {
      return {
        tempodeespera: accept.getTime() - initial.getTime(),
        tempodeatendimento: finish.getTime() - accept.getTime(),
        tempodeatendimentototal:
          accept.getTime() -
          initial.getTime() +
          (finish.getTime() - accept.getTime())
      };
    }
  });

  let tempodeespera = resultTotal
    .map(e => e.tempodeespera)
    .filter(function (value) {
      return value !== 0;
    });

  let tempodeatendimento = resultTotal
    .map(e => e.tempodeatendimento)
    .filter(function (value) {
      return value !== 0;
    });
  let tempodeatendimentototal = resultTotal
    .map(e => e.tempodeatendimentototal)
    .filter(function (value) {
      return value !== 0;
    });
  var espera =
    tempodeespera.reduce((previous, current, ___, __) => {
      return (previous += current ?? 0);
    }, 0) /
    tempodeespera.length /
    (1000 * 60);

  var atendimento =
    tempodeatendimento.reduce((previous, current, ___, __) => {
      return (previous += current);
    }, 0) /
    tempodeatendimento.length /
    (1000 * 60);

  var finalizado =
    tempodeatendimentototal.reduce((previous, current, ___, __) => {
      return (previous += current);
    }, 0) /
    tempodeatendimentototal.length /
    (1000 * 60);

  return {
    chats,
    atendimento,
    finalizado,
    espera,
    qtespera: statusBy[0],
    qtatendimento: statusBy[1],
    qtfinalizado: statusBy[2]
  };
};

export default ListTicketsServiceGeneral;
