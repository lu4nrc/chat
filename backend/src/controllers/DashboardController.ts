import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import ListToday from "../services/DashboardServices/ListToday";
import ListSevenDays from "../services/DashboardServices/ListSevenDays";
import ListFourteenDays from "../services/DashboardServices/ListFourteenDays";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { today, status, queues, users, media, outin } = await ListToday();

  return res.status(200).json({ today, status, queues, users, media, outin });
};
export const seven = async (req: Request, res: Response): Promise<Response> => {
  const { today, status, queues, users, media, outin } = await ListSevenDays();

  return res.status(200).json({ today, status, queues, users, media, outin });
};
export const fourteen = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { today, status, queues, users, media, outin } =
    await ListFourteenDays();

  return res.status(200).json({ today, status, queues, users, media, outin });
};
