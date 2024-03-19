import AppError from "../../errors/AppError";
import Transmission from "../../models/Transmission";
import { logger } from "../../utils/logger";
interface Request {
  id: number;
  name: string;
  contacts: ContactTransmission[];
  messages: Object[];
}
interface ContactTransmission {
  name: string;
  number: string;
  email: string;
  isGroup: boolean;
  id: number;
}
const UpdateTransmissionService = async ({
  id,
  name,
  contacts,
  messages
}: Request): Promise<void> => {
  try {
    var transmission = await Transmission.findOne({
      where: { id }
    });
    if (transmission) {
      transmission.update({ name, contacts, messages });
    }
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_UPDATE_TRANSMISSION");
  }
};

export default UpdateTransmissionService;
