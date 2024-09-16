import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsServiceFull from "../services/TicketServices/ListTicketsServiceFull";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import formatBody from "../helpers/Mustache";

import ListTicketsServiceToday from "../services/TicketServices/ListTicketsServiceToday";
import TicketsSearchService from "../services/TicketServices/TicketsSearchService";
import ListAllOpenTickets from "../services/TicketServices/ListAllOpenTickets";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
};

type FilterFullQuery = {
  dateInitial: string;
  dateFinal: string;
  userId: string;
  queue?: string;
  pageNumber: string;
  searchParam: string;
  status: string;
};

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  isOutbound: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;

  let queueIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    queueIds,
    withUnreadMessages
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, isOutbound }: TicketData = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    isOutbound
  });
console.log("AQUI create")
  const io = getIO();
  io.to(ticket.status).emit("ticket", {
    action: "update",
    ticket
  });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const contact = await ShowTicketService(ticketId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  const ticketUpdated = await ShowTicketService(ticket.id);
  if (ticket.status === "waitingRating") {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId);

    const { farewellMessage } = whatsapp;

    if (farewellMessage) {
      await SendWhatsAppMessage({
        body: formatBody(farewellMessage, ticket.contact),
        ticket
      });
    }
  }

  return res.status(200).json(ticketUpdated);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await DeleteTicketService(ticketId);

  const io = getIO();
  io.to(ticket.status).to(ticketId).to("notification").emit("ticket", {
    action: "delete",
    ticketId: +ticketId
  });

  return res.status(200).json({ message: "ticket deleted" });
};

export const fullfilter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { dateInitial, dateFinal, userId, pageNumber, queue } =
    req.query as FilterFullQuery;

  const { tickets } = await ListTicketsServiceFull({
    dateInitial,
    dateFinal,
    userId,
    pageNumber
  });

  return res.status(200).json({ tickets });
};

export const allOpen = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tickets = await ListAllOpenTickets();

  return res.status(200).json({ tickets });
};

/* export const generalFilter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { dateInitial, dateFinal, userId, queue } =
    req.query as FilterFullQuery;
  const {
    chats,
    espera,
    atendimento,
    finalizado,
    qtespera,
    qtatendimento,
    qtfinalizado
  } = await ListTicketsServiceGeneral({
    dateInitial,
    dateFinal,
    userId,
    queue
  });

  return res.status(200).json({
    chats,
    espera,
    atendimento,
    finalizado,
    qtespera,
    qtatendimento,
    qtfinalizado
  });
}; */

export const todayFilter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {} = req.query as FilterFullQuery;

  const { countTickets, espera, atendimento, finalizado } =
    await ListTicketsServiceToday({});

  return res.status(200).json({
    countTickets,
    espera,
    atendimento,
    finalizado
  });
};

export const searchFilter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    dateInitial,
    dateFinal,
    userId,
    queue,
    searchParam,
    pageNumber,
    status
  } = req.query as FilterFullQuery;
  const { chats, hasMore } = await TicketsSearchService({
    dateInitial,
    dateFinal,
    userId,
    queue,
    searchParam,
    pageNumber,
    status
  });

  return res.status(200).json({
    chats,
    hasMore
  });
};
