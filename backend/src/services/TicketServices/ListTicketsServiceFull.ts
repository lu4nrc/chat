
import { Op, Includeable, fn } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";


interface Request {
  dateInitial?: string;
  dateFinal?: string;
  userId?: string;
  pageNumber: string;
}

interface Response {
  tickets: Ticket[];

}

const ListTicketsServiceFull = async ({
  dateInitial, dateFinal, userId, pageNumber = "1"
}: Request): Promise<Response> => {
  let conditions = {};
  let includeCondition: Includeable[];
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  includeCondition = [{
    model: User,
    as: "user",
    attributes: ["id", "name"],
    required: false,
    duplicating: false
  }, {
    model: Contact,
    as: "contact",
    attributes: ["id", "name", "profilePicUrl"],
    required: false,
    duplicating: false
  }]
  if (userId) {
    conditions = {
      ...conditions,
      userId: userId,

    }
  }
  else {
    conditions = {
      ...conditions,
      userId: { [Op.not]: null }
    }
  }
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
  const { rows: tickets } = await Ticket.findAndCountAll({

    where: conditions, include: includeCondition, limit, offset
  });

  return {
    tickets,


  };
};

export default ListTicketsServiceFull;
