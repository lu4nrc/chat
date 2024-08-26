import Ticket from "../../models/Ticket";
import { Includeable, Op } from "sequelize";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInMinutes,
  format
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
}

const ListToday = async (): Promise<Response> => {
  const includeCondition: Includeable[] = [
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["name"]
    }
  ];

  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);
  const fourteenDaysAgo = subDays(today, 14);

  const tickets = await Ticket.findAll({
    where: {
      isGroup: false,
      createdAt: {
        [Op.between]: [startOfDay(fourteenDaysAgo), endOfDay(today)]
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
        updatedAt
      } = current;

      const formattedHour = format(
        status !== "closed" ? createdAt : updatedAt,
        "HH"
      );

      //? Group by Today
      const todayEntry = acc.today.find(entry => entry.hour === formattedHour);
      if (todayEntry) {
        todayEntry[status]++;
        todayEntry.total++;
      } else {
        acc.today.push({
          hour: formattedHour,
          total: 1,
          open: status === "open" ? 1 : 0,
          pending: status === "pending" ? 1 : 0,
          closed: status === "closed" ? 1 : 0
        });
      }

      //?Grouped by Status
      acc.status.total++;
      if (status === "open") {
        acc.status.open++;
      }
      if (status === "pending") {
        acc.status.pending++;
      }
      if (status === "closed") {
        acc.status.closed++;
      }

      //?Grouped by Media
      if (status === "closed") {
        acc.media.total++;
        const accept = differenceInMinutes(acceptDate, createdAt);
        const atend = differenceInMinutes(updatedAt, acceptDate);
        const total = differenceInMinutes(updatedAt, createdAt);
        acc.media.m_accept += Math.round(accept);
        acc.media.m_atend += Math.round(atend);
        acc.media.m_total += Math.round(total);
      }

      //?Grouped by Users

      if (userId) {
        let user = acc.users.find(user => user.id === userId);
        const m_time =
          status === "closed" ? differenceInMinutes(updatedAt, createdAt) : 0;

        if (user) {
          user[status]++;
          user.total++;
          if (status === "closed") user.m_time += m_time;
        } else {
          acc.users.push({
            id: userId,
            user_name: current.user?.name || "Sem usuário",
            total: 1,
            open: status === "open" ? 1 : 0,
            pending: status === "pending" ? 1 : 0,
            closed: status === "closed" ? 1 : 0,
            m_time: status === "closed" ? m_time : 0
          });
        }
      }
      //?Grouped by Queue
      const queueName = current.queue ? current.queue.name : "Sem departamento";
      const queueIdKey = queueId || -1; // Using -1 as a key for "Sem departamento"
      let queue = acc.queues.find(queue => queue.id === queueIdKey);

      const mq_time =
        status === "closed" ? differenceInMinutes(updatedAt, createdAt) : 0;

      if (queue) {
        queue[status]++;
        queue.total++;
        if (status === "closed") queue.mq_time += mq_time;
      } else {
        acc.queues.push({
          id: queueIdKey,
          queue_name: queueName,
          total: 1,
          open: status === "open" ? 1 : 0,
          pending: status === "pending" ? 1 : 0,
          closed: status === "closed" ? 1 : 0,
          mq_time: status === "closed" ? mq_time : 0
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
      }  */

      return acc;
    },
    {
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

  const sortedUsers = grouped.users.sort(
    (a, b) => parseInt(b.m_time, 10) - parseInt(a.m_time, 10)
  );

  const sortedHours = grouped.today.sort(
    (a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10)
  );

  const sortedQueues = grouped.queues.sort(
    (a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10)
  );

  return {
    today: sortedHours,
    status: grouped.status,
    media: grouped.media,
    queues: sortedQueues,
    users: sortedUsers
  };
};

export default ListToday;
