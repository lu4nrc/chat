import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const ImportContactsService = async (userId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);
  const wbot = getWbot(defaultWhatsapp.id);
  let phoneContacts;

  try {
    phoneContacts = await wbot.getContacts();
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name, isGroup }) => {
        if (!number) {
          return null;
        }
        if (!name) {
          return null;
          //  name = number;
        }

        /* Só importa n° Brasileiros */
        if (!/^55/.test(number) && isGroup === false) {
          return null;
        }
        
        if(number.length > 14 && isGroup === false) {
          return null
        }

        const numberExists = await Contact.findOne({
          where: { number }
        });

        if (numberExists) return null;
        try {
          return Contact.create({ number, name });
        } catch (err) {
          logger.error(err);
        }
      })
    );
  }
};

export default ImportContactsService;
