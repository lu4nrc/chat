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

interface DashboardResponse {
  today: any[];
  status: any;
  media: any;
  queues: any[];
  users: any[];
  outin: any;
}

const ListSevenDays = async (): Promise<DashboardResponse> => {
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
  const fourteenDaysAgo = subDays(today, 14);

  const tickets = await Ticket.findAll({
    where: {
      isGroup: false,
      createdAt: {
        [Op.between]: [
          startOfDay(fourteenDaysAgo).getTime(),
          endOfDay(today).getTime()
        ]
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

      // 🔹 Agrupado por dia
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

      // 🔹 Inbound / Outbound
      if (isOutbound) {
        acc.outin.outbound++;
      } else {
        acc.outin.inbound++;
      }

      // 🔹 Média de tempo
      acc.media.total++;
      const accept = differenceInMinutes(acceptDate, createdAt);
      const atend = differenceInMinutes(updatedAt, acceptDate);
      const total = differenceInMinutes(updatedAt, createdAt);

      acc.media.m_accept += Math.round(accept);
      acc.media.m_atend += Math.round(atend);
      acc.media.m_total += Math.round(total);

      // 🔹 Agrupado por usuário
      if (userId) {
        const m_time = differenceInMinutes(updatedAt, createdAt);
        let user = acc.users.find((user: any) => user.id === userId);

        if (user) {
          user[status]++;
          user.total++;
          user.m_time += m_time;
          user.m_time_avg = Math.round(user.m_time / user.total);
          if (rating) {
            user.rating.value += rating;
            user.rating.qtd += 1;
          }
        } else {
          acc.users.push({
            id: userId,
            imageUrl: current.user?.imageUrl,
            user_name: current.user?.name || "Sem usuário",
            total: 1,
            m_time,
            m_time_avg: m_time,
            rating: {
              qtd: rating ? 1 : 0,
              value: rating ? rating : 0
            }
          });
        }
      }

      // 🔹 Agrupado por fila
      const queueName = current.queue ? current.queue.name : "Sem departamento";
      const queueIdKey = queueId || -1;
      const mq_time = differenceInMinutes(updatedAt, createdAt);

      let queue = acc.queues.find((queue: any) => queue.id === queueIdKey);

      if (queue) {
        queue[status]++;
        queue.total++;
        if (rating) {
          queue.rating.value += rating;
          queue.rating.qtd += 1;
        }
        queue.mq_time += mq_time;
        queue.mq_time_avg = Math.round(queue.mq_time / queue.total);
      } else {
        acc.queues.push({
          id: queueIdKey,
          queue_name: queueName,
          fill: current.queue ? current.queue.color : "hsl(347, 76%, 50%)",
          total: 1,
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

  const sortedDays = grouped.today.sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    today: sortedDays,
    status: grouped.status,
    media: grouped.media,
    queues: grouped.queues,
    users: grouped.users,
    outin: grouped.outin
  };
};

export default ListSevenDays;
