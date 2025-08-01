import { Request, Response } from "express";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";
import ShowOpenHours from "../services/SettingServices/ShowOpenHours";
import UpdateOpenHours from "../services/SettingServices/UpdateOpenHours";



export const index = async (req: Request, res: Response): Promise<Response> => {
/*   if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  } */

  const settings = await ListSettingsService();

  return res.status(200).json(settings);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { settingKey: key } = req.params;
  const { value } = req.body;

  const setting = await UpdateSettingService({
    key,
    value
  });

  const io = getIO();
  io.emit("settings", {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};


export const openingHours = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const openingHours = await ShowOpenHours();
  return res.status(200).json(openingHours);
};





export const openingHoursEdit = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { openingHours } = req.body ;

  await UpdateOpenHours({  openingHours:openingHours });


  return res.status(200).json();


};