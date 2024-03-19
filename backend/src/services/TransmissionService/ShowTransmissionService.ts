import { Console } from "console";
import AppError from "../../errors/AppError";
import Transmission from "../../models/Transmission";

const ShowTransmissionService = async (): Promise<Transmission[]> => {
  try {
   var transmissions = await Transmission.findAll();
   return transmissions
  } catch (e) {
    throw new AppError("ERR_SHOW_TRANSMISSIONS");
  }
};

export default ShowTransmissionService;
