import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
const CheckContactNumber = async (number: string): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    const validNumber: any = await wbot.getNumberId(`${number}@c.us`);
    return validNumber.user;
  } catch (err: any) {
    logger.error(err);
  }
};

export default CheckContactNumber;
