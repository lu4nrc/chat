import Ticket from "../../models/Ticket";
import { Includeable, Op } from "sequelize";
import { startOfDay, endOfDay, differenceInMinutes, format } from "date-fns";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";

/* =======================
   TIPOS
======================= */

type TicketStatus = "open" | "pending" | "closed";

interface RatingGroup {
  qtd: number;
  value: number;
}

interface TodayGroup {
  hour: string;
  total: number;
}

interface MediaGroup {
  total: number;
  m_accept: number;
  m_atend: number;
  m_total: number;
}

interface OutInGroup {
  outbound: number;
  inbound: number;
}

interface StatusGroup {
  total: number;
  open: number;
  pending: number;
  closed: number;
}

interface UserGroup {
  id: number;
  imageUrl?: string;
  user_name: string;
  total: number;
  m_time: number;
  m_time_avg: number;
  rating: RatingGroup;
  tickets: Ticket[];
  open: number;
  pending: number;
  closed: number;
}

interface QueueGroup {
  id: number;
  queue_name: string;
  fill: string;
  total: number;
  mq_time: number;
  mq_time_avg: number;
  rating: RatingGroup;
  open: number;
  pending: number;
  closed: number;
}

interface GroupedResult {
  today: TodayGroup[];
  status: StatusGroup;
  media: MediaGroup;
  users: UserGroup[];
  queues: QueueGroup[];
  outin: OutInGroup;
}

/* =======================
   SERVICE
======================= */

const ListToday = async (): Promise<GroupedResult> => {
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
        [Op.between]: [startOfDay(today).getTime(), endOfDay(today).getTime()]
      }
    },
    include: includeCondition,
    attributes: { exclude: ["lastMessage", "whatsappId", "unreadMessages"] }
  });

  const grouped = tickets.reduce<GroupedResult>(
    (acc, current) => {
      const status = current.status as TicketStatus;

      const {
        userId,
        queueId,
        createdAt,
        updatedAt,
        acceptDate,
        isOutbound,
        rating
      } = current;

      const hour = format(updatedAt ?? createdAt, "HH");

      /* TODAY */
      const todayEntry = acc.today.find(e => e.hour === hour);
      todayEntry ? todayEntry.total++ : acc.today.push({ hour, total: 1 });

      /* IN / OUT */
      isOutbound ? acc.outin.outbound++ : acc.outin.inbound++;

      /* STATUS */
      acc.status.total++;
      acc.status[status]++;

      /* MEDIA */
      acc.media.total++;
      acc.media.m_accept += differenceInMinutes(acceptDate, createdAt);
      acc.media.m_atend += differenceInMinutes(updatedAt, acceptDate);
      acc.media.m_total += differenceInMinutes(updatedAt, createdAt);

      /* USERS */
      if (userId) {
        let user = acc.users.find(u => u.id === userId);
        const mTime = differenceInMinutes(updatedAt, createdAt);

        if (!user) {
          user = {
            id: userId,
            imageUrl: current.user?.imageUrl,
            user_name: current.user?.name || "Sem usuário",
            total: 0,
            m_time: 0,
            m_time_avg: 0,
            rating: { qtd: 0, value: 0 },
            tickets: [],
            open: 0,
            pending: 0,
            closed: 0
          };
          acc.users.push(user);
        }

        user[status]++;
        user.total++;
        user.m_time += mTime;
        user.m_time_avg = Math.round(user.m_time / user.total);
        user.tickets.push(current);

        if (rating) {
          user.rating.qtd++;
          user.rating.value += rating;
        }
      }

      /* QUEUES */
      const queueKey = queueId ?? -1;
      let queue = acc.queues.find(q => q.id === queueKey);
      const mqTime = differenceInMinutes(updatedAt, createdAt);

      if (!queue) {
        queue = {
          id: queueKey,
          queue_name: current.queue?.name || "Sem departamento",
          fill: current.queue?.color || "hsl(347, 76%, 50%)",
          total: 0,
          mq_time: 0,
          mq_time_avg: 0,
          rating: { qtd: 0, value: 0 },
          open: 0,
          pending: 0,
          closed: 0
        };
        acc.queues.push(queue);
      }

      queue[status]++;
      queue.total++;
      queue.mq_time += mqTime;
      queue.mq_time_avg = Math.round(queue.mq_time / queue.total);

      if (rating) {
        queue.rating.qtd++;
        queue.rating.value += rating;
      }

      return acc;
    },
    {
      today: [],
      status: { total: 0, open: 0, pending: 0, closed: 0 },
      media: { total: 0, m_accept: 0, m_atend: 0, m_total: 0 },
      outin: { inbound: 0, outbound: 0 },
      users: [],
      queues: []
    }
  );

  grouped.today.sort((a, b) => Number(a.hour) - Number(b.hour));

  return grouped;
};

export default ListToday;
