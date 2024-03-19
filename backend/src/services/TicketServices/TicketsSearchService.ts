import { Includeable, Op, col, fn, where } from "sequelize";
import Ticket from "../../models/Ticket";
import moment from "moment-timezone";
import Message from "../../models/Message";

interface Request {
  dateInitial?: string;
  dateFinal?: string;
  userId?: string;
  queue?: string;
  searchParam?: string;
  pageNumber?: string;
  status?: string;
}

interface Response {
  chats?: Ticket[];
  hasMore: boolean;
}

const TicketsSearchService = async ({
  dateInitial,
  dateFinal,
  userId,
  queue,
  searchParam = "",
  pageNumber = "1",
  status
}: Request): Promise<Response> => {
  let conditions = {};
  let includeCondition: Includeable[];

  includeCondition = [];

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
    var updatedAt = {
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
      updatedAt
    };
  }

  if (status) {
    conditions = {
      ...conditions,
      status: status
    };
  }
  conditions = {
    ...conditions,
    isGroup: { [Op.is]: false }
  };
  if (searchParam !== "") {
    const sanitizedSearchParam = searchParam!.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];
  }
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: chats } = await Ticket.findAndCountAll({
    where: conditions,
    include: ["contact", "queue", "user", ...includeCondition],
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });
  const hasMore = count > offset + chats.length;

  return {
    chats,
    hasMore
  };
};

export default TicketsSearchService;
