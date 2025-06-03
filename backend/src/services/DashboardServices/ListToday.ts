import Ticket from "../../models/Ticket";
import { Includeable, Op } from "sequelize";
import { get, set } from "../../libs/cache";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInMinutes,
  format,
  isEqual
} from "date-fns";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";

interface Response {
  today: any;
  status: any;
  media: any;
  queues: any;
  users: any;
  outin: any;
}

const CACHE_KEY = "dashboard:listToday";

const ListToday = async (): Promise<Response> => {
  const cachedResponse = get<Response>(CACHE_KEY);
  if (cachedResponse) {
    return cachedResponse;
  }

  const includeCondition: Includeable[] = [
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "imageUrl"]
    },
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["name", "color"]
    }
  ];

  const today = new Date();

  const tickets = await Ticket.findAll({
    where: {
      isGroup: false,
      status: "closed",
      createdAt: {
        [Op.between]: [startOfDay(today), endOfDay(today)]
      }
    },
    include: includeCondition,
    attributes: { exclude: ["lastMessage", "whatsappId", "unreadMessages"] }
  });

  const grouped = tickets.reduce(
    (acc: any, current: any) => {
      const {
        status,
        userId,
        queueId,
        contactId,
        createdAt,
        acceptDate,
        isOutbound,
        updatedAt,
        rating
      } = current;

      const formattedHour = format(
        status !== "closed" ? createdAt : updatedAt,
        "HH"
      );

      //? Group by Today
      const todayEntry = acc.today.find(entry => entry.hour === formattedHour);
      if (todayEntry) {
        todayEntry.total++;
      } else {
        acc.today.push({
          hour: formattedHour,
          total: 1
        });
      }

      //?Grouped by ativoPassivo
      if (isOutbound) {
        acc.outin.outbound++;
      } else {
        acc.outin.inbound++;
      }

      /*       //?Grouped by Status
      acc.status.total++;
      if (status === "open") {
        acc.status.open++;
      }
      if (status === "pending") {
        acc.status.pending++;
      }
      if (status === "closed") {
        acc.status.closed++;
      } */

      //?Grouped by Media
      acc.media.total++;
      const accept = differenceInMinutes(acceptDate, createdAt);
      const atend = differenceInMinutes(updatedAt, acceptDate);
      const total = differenceInMinutes(updatedAt, createdAt);
      acc.media.m_accept += Math.round(accept);
      acc.media.m_atend += Math.round(atend);
      acc.media.m_total += Math.round(total);

      //?Grouped by Users
      if (userId) {
        let user = acc.users.find(user => user.id === userId);
        const m_time = differenceInMinutes(updatedAt, createdAt);

        if (user) {
          user[status]++;
          user.total++;
          user.m_time += m_time;
          user.m_time_avg = Math.round(user.m_time / user.total);
          rating ? (user.rating.value += rating) : null;
          rating ? (user.rating.qtd += 1) : null;
          user.tickets.push(current);
        } else {
          acc.users.push({
            id: userId,
            imageUrl: current.user?.imageUrl,
            user_name: current.user?.name || "Sem usuário",
            total: 1,
            m_time: m_time,
            m_time_avg: m_time,
            rating: { qtd: rating ? 1 : 0, value: rating ? rating : 0 },
            tickets: [current]
          });
        }
      }
      //?Grouped by Queue
      const queueName = current.queue ? current.queue.name : "Sem departamento";
      const queueIdKey = queueId || -1;
      let queue = acc.queues.find(queue => queue.id === queueIdKey);

      const mq_time = differenceInMinutes(updatedAt, createdAt);

      if (queue) {
        queue[status]++;
        queue.total++;
        // queue.tickets.push(current);
        rating ? (queue.rating.value += rating) : null;
        rating ? (queue.rating.qtd += 1) : null;
        queue.mq_time += mq_time;
        queue.mq_time_avg = Math.round(queue.mq_time / queue.total); //Media queue
      } else {
        acc.queues.push({
          id: queueIdKey,
          queue_name: queueName,
          fill: current.queue ? current.queue.color : "hsl(347, 76%, 50%)",
          total: 1,
          rating: { qtd: rating ? 1 : 0, value: rating ? rating : 0 },
          mq_time: mq_time,
          mq_time_avg: mq_time
          //  tickets: []
        });
      }

      //?Grouped by Contact

/*       if (!acc.contacts[contactId]) {
        acc.contacts[contactId] = {
          contact_name: current.contact?.name || "Sem contato",
          n_closed: 0
        };
      }
      if (status === "closed") {
        acc.contacts[contactId].n_closed++;
      }
 */
      return acc;
    },
    {
      outin: { outbound: 0, inbound: 0 },
      status: { total: 0, open: 0, pending: 0, closed: 0 },
      today: [],
      media: {
        total: 0,
        m_accept: 0,
        m_atend: 0,
        m_total: 0
      },
      users: [],
      queues: [],
      contactId: {}
    }
  );

  const sortedHours = grouped.today.sort(
    (a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10)
  );

  const response = {
    today: sortedHours,
    status: grouped.status,
    media: grouped.media,
    queues: grouped.queues,
    users: grouped.users,
    outin: grouped.outin
  };

  set(CACHE_KEY, response, 300); // Cache for 5 minutes

  return response;
};

export default ListToday;
