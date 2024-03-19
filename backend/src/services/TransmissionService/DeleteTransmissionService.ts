import { Console } from "console";
import AppError from "../../errors/AppError";
import Transmission from "../../models/Transmission";
interface Request{
  id:number;
}
const DeleteTransmissionService = async ({id}:Request): Promise<void> => {
  try {
   await Transmission.destroy({
    where:{
      id:id
    }
   });
  } catch (e) {
    throw new AppError("ERR_DELETE_TRANSMISSION");
  }
};

export default DeleteTransmissionService;
