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
import { init } from "@sentry/node";

interface Response {
  today: any;
  status: any;
  media: any;
  queues: any;
  users: any;
}

const ListSevenDays = async (): Promise<Response> => {
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
      attributes: ["name", "color"]
    }
  ];

  const today = new Date();
  //const sevenDaysAgo = subDays(today, 7);
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

 
      
      //? Group by Today
      const formattedCreatedAt = format(createdAt, "yyyy-MM-dd");
      
      const todayEntry = acc.today.find(
        entry => entry.date === formattedCreatedAt
      );
      if (todayEntry) {
        todayEntry.total++;
      } else {
        acc.today.push({
          date: formattedCreatedAt,
          total: 1
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
          if (status === "closed") {
            user.m_time += m_time;
            user.tickets.push(current);
            user.m_time_avg = Math.round(user.m_time / user.closed);
          }
        } else {
          acc.users.push({
            id: userId,
            user_name: current.user?.name || "Sem usuário",
            total: 1,
            open: status === "open" ? 1 : 0,
            pending: status === "pending" ? 1 : 0,
            closed: status === "closed" ? 1 : 0,
            m_time: status === "closed" ? m_time : 0,
            m_time_avg: status === "closed" ? m_time : 0,
            tickets: [current]
          });
        }
      }
      //?Grouped by Queue
      const queueName = current.queue ? current.queue.name : "Sem departamento";
      const queueIdKey = queueId || -1; // Usando -1 como chave para "Sem departamento"
      let queue = acc.queues.find(queue => queue.id === queueIdKey);

      const mq_time =
        status === "closed" ? differenceInMinutes(updatedAt, createdAt) : 0;

      if (queue) {
        queue[status]++;
        queue.total++;
        if (status === "closed") {
          // queue.tickets.push(current);
          queue.mq_time += mq_time;
          queue.mq_time_avg = Math.round(queue.mq_time / queue.closed);
        }
      } else {
        acc.queues.push({
          id: queueIdKey,
          queue_name: queueName,
          fill: current.queue ? current.queue.color : "hsl(0, 0%, 90%)",
          total: 1,
          open: status === "open" ? 1 : 0,
          pending: status === "pending" ? 1 : 0,
          closed: status === "closed" ? 1 : 0,
          mq_time: status === "closed" ? mq_time : 0,
          mq_time_avg: status === "closed" ? mq_time : 0
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

  const sortedHours = grouped.today.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return {
    today: sortedHours,
    status: grouped.status,
    media: grouped.media,
    queues: grouped.queues,
    users: grouped.users
  };
};

export default ListSevenDays;
