import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import ShowContactService from "../ContactServices/ShowContactService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  queueId?: number;
  isOutbound?: boolean;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  isOutbound
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);

  await CheckContactOpenTickets(contactId, defaultWhatsapp.id);

  const { isGroup } = await ShowContactService(contactId);

  if (!queueId) {
    const user = await User.findByPk(userId, { include: ["queues"] });

    if (!user) {
      console.log("Usuário não encontrado.");
      queueId = undefined;
    } else if (user.queues && user.queues.length > 0) {
      queueId = user.queues[0].id;
    } else {
      console.log("Usuário sem departamento associadas.");
      queueId = undefined;
    }
  }

  const durationDate = new Date();
  const { id }: Ticket = await defaultWhatsapp.$create("ticket", {
    contactId,
    status,
    isGroup,
    userId,
    queueId,
    durationDate: durationDate,
    initialDate: durationDate,
    acceptDate: durationDate,
    finishDate: durationDate,
    isOutbound
  });

  const ticket = await Ticket.findByPk(id, { include: ["contact"] });

  

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;
