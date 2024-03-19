import AppError from "../../errors/AppError";
import Transmission from "../../models/Transmission";
import { logger } from "../../utils/logger";
interface Request {
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
const CreateTransmissionService = async ({
  name,
  contacts,
  messages
}: Request): Promise<void> => {
  try {
    await Transmission.create({
      name,
      contacts: contacts,
      messages: messages
    });
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_CREATING_TRANSMISSION");
  }
};

export default CreateTransmissionService;
