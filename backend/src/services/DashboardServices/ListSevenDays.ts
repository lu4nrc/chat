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
  today: any[];
  status: any;
  media: any;
  queues: any[];
  users: any[];
  outin: {
    outbound: number;
    inbound: number;
  };
}

const ListSevenDays = async (): Promise<Response> => {
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
  const sevenDaysAgo = subDays(today, 7);

  const tickets = await Ticket.findAll({
    where: {
      isGroup: false,
      createdAt: {
        [Op.between]: [startOfDay(today).getTime(), endOfDay(today).getTime()]
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
        createdAt,
        acceptDate,
        isOutbound,
        updatedAt,
        rating
      } = current;

      /* ================= TODAY ================= */
      const formattedCreatedAt = format(createdAt, "yyyy-MM-dd");

      const todayEntry = acc.today.find(
        (entry: any) => entry.date === formattedCreatedAt
      );

      if (todayEntry) {
        todayEntry.total++;
      } else {
        acc.today.push({
          date: formattedCreatedAt,
          total: 1
        });
      }

      /* ================= OUT / IN ================= */
      if (isOutbound) {
        acc.outin.outbound++;
      } else {
        acc.outin.inbound++;
      }

      /* ================= MEDIA ================= */
      acc.media.total++;

      const accept = acceptDate
        ? differenceInMinutes(acceptDate, createdAt)
        : 0;

      const atend =
        acceptDate && updatedAt
          ? differenceInMinutes(updatedAt, acceptDate)
          : 0;

      const total = updatedAt ? differenceInMinutes(updatedAt, createdAt) : 0;

      acc.media.m_accept += Math.round(accept);
      acc.media.m_atend += Math.round(atend);
      acc.media.m_total += Math.round(total);

      /* ================= USERS ================= */
      if (userId) {
        let user = acc.users.find((u: any) => u.id === userId);

        const m_time = updatedAt
          ? differenceInMinutes(updatedAt, createdAt)
          : 0;

        if (user) {
          if (!user[status]) user[status] = 0;
          user[status]++;

          user.total++;
          user.m_time += m_time;
          user.m_time_avg = Math.round(user.m_time / user.total);

          if (rating) {
            user.rating.value += rating;
            user.rating.qtd += 1;
          }

          user.tickets.push(current);
        } else {
          acc.users.push({
            id: userId,
            imageUrl: current.user?.imageUrl,
            user_name: current.user?.name || "Sem usuário",
            total: 1,
            [status]: 1,
            m_time,
            m_time_avg: m_time,
            rating: {
              qtd: rating ? 1 : 0,
              value: rating ? rating : 0
            },
            tickets: [current]
          });
        }
      }

      /* ================= QUEUES ================= */
      const queueName = current.queue?.name || "Sem departamento";
      const queueIdKey = queueId || -1;

      let queue = acc.queues.find((q: any) => q.id === queueIdKey);

      const mq_time = updatedAt ? differenceInMinutes(updatedAt, createdAt) : 0;

      if (queue) {
        if (!queue[status]) queue[status] = 0;
        queue[status]++;

        queue.total++;
        queue.mq_time += mq_time;
        queue.mq_time_avg = Math.round(queue.mq_time / queue.total);

        if (rating) {
          queue.rating.value += rating;
          queue.rating.qtd += 1;
        }
      } else {
        acc.queues.push({
          id: queueIdKey,
          queue_name: queueName,
          fill: current.queue?.color || "hsl(347, 76%, 50%)",
          total: 1,
          [status]: 1,
          rating: {
            qtd: rating ? 1 : 0,
            value: rating ? rating : 0
          },
          mq_time,
          mq_time_avg: mq_time
        });
      }

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
      queues: []
    }
  );

  const sortedToday = grouped.today.sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    today: sortedToday,
    status: grouped.status,
    media: grouped.media,
    queues: grouped.queues,
    users: grouped.users,
    outin: grouped.outin
  };
};

export default ListSevenDays;
