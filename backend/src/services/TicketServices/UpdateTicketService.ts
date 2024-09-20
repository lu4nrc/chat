import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import CheckOpeningHours from "../../helpers/CheckOpeningHours";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import { parseInitialDate } from "../../utils/parserdate";
import CreateMessageServiceCustom from "../MessageServices/CreateMessageCustomService";
import ShowQueueService from "../QueueService/ShowQueueService";
import ShowUserService from "../UserServices/ShowUserService";
import ShowTicketService from "./ShowTicketService";

interface TicketData {
  status?: string;
  userId?: number;
  queueId?: number;
  whatsappId?: number;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
  const { status, userId, queueId, whatsappId } = ticketData;

  const ticket = await ShowTicketService(ticketId);
  await SetTicketMessagesAsRead(ticket);

  if (whatsappId && ticket.whatsappId !== whatsappId) {
    await CheckContactOpenTickets(ticket.contactId, whatsappId);
  }

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;
  const oldQueueId = ticket.queueId;
  const isTransfer = (oldUserId !== undefined) && (userId !== oldUserId) && (status !== "closed");


  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id, ticket.whatsappId);
  }
  if (isTransfer) {
    if (oldQueueId !== queueId || oldUserId !== userId) {
      var queueName = "";
      var userName = "fila de atendimento";
      if (queueId) {
        queueName = (await ShowQueueService(queueId))?.name;
      }
      if (userId) {
        userName = (await ShowUserService(userId))?.name;
      }
      var phrase = `_Atendimento transferido de *${ticket.user?.name.trim()} ${ticket.queue?.name.trim() ?? ""}* para *${userName?.trim()} ${queueName.trim()}* - ${parseInitialDate(new Date())}_`;
      CreateMessageServiceCustom({ messageData: { body: phrase, ticketId: ticket.id, contactId: ticket.contactId, fromMe: true, read: true } })
    }
  }


  if (oldStatus === "pending" && status === "open") {
  
   await ticket.update({
      status,
      queueId,
      userId,
      durationDate: new Date(),
      initialDate: await CheckOpeningHours(ticket.initialDate, new Date()),
      acceptDate: new Date(),
      finishDate: new Date(),
    }); 
  } else if (oldStatus === "open" && status === "closed") {
    await ticket.update({
      status,
      queueId,
      userId,
      durationDate: new Date(),
      finishDate: new Date()
    });
  } else {
    await ticket.update({
      status,
      queueId,
      userId,
      durationDate: new Date(),
    });
  }



  if (whatsappId) {
    await ticket.update({
      whatsappId,
      durationDate: new Date()
    });
  }

  await ticket.reload();

  const io = getIO();

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(oldStatus).emit("ticket", {
      action: "delete",
      ticketId: ticket.id
    });
  }



  io.to(ticket.status)
    .to("notification")
    .to(ticketId.toString())
    .emit("ticket", {
      action: "update",
      ticket
    });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
