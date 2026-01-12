import Scheduled from "../../models/Scheduled";
import { Op } from "sequelize";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { parseEndDate, parseInitialDate } from "../../utils/parserdate";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import Ticket from "../../models/Ticket";
import { format } from "date-fns";
const NotificationScheduledService = async (): Promise<void> => {
  var data = new Date();
  data.setMilliseconds(0);
  const scheduleds = await Scheduled.findAll({
    where: {
      datesNotify: {
        [Op.contains]: [data.toISOString()]
      }
    }
  });
  var whatsappDefault = (await ListWhatsAppsService()).filter(
    e => e.isDefault === true
  );
  scheduleds.map(scheduled => {
    const initDate = format(scheduled.startDate, "dd/MM/yyyy");
    const finishDate = format(scheduled.endDate, "dd/MM/yyyy");

    const initHours = format(scheduled.startDate, "HH:mm");
    const finishHours = format(scheduled.endDate, "HH:mm");

    var phrase = `*AGENDAMENTO* \n *Título:* ${
      scheduled.title
    }\n\n \u{1F4C6} *Data:* ${
      initDate === finishDate ? initDate : `${initDate} até ${finishDate}`
    }\n \u{1F553} *Horário:* ${initHours}h às ${finishHours}h \n\n *Anfitrião:* ${
      scheduled.anfitriao.name
    } \n *${scheduled.typeEvent === 1 ? "Local" : "Online"}:* ${
      scheduled.locale
    } \n *Participantes:* ${scheduled.externals.map(
      e => e.name + ", "
    )}${scheduled.attendants.map(i => " " + i.name)} \n *Descrição:* ${
      scheduled.description
    }`;
    scheduled.notificationType.map(async (e: number) => {
      if (e === 1) {
        await Promise.all(
          scheduled.externals.map(async contact => {
            var ticket: any = await FindOrCreateTicketService(
              contact,
              whatsappDefault[0].id,
              0,
              undefined,
              true
            );
            await SendWhatsAppMessage({
              body: phrase,
              ticket
            });
          })
        );
      } else if (e === 2) {
        //enviar notificação pelo email
        return;
      } else {
        return;
      }
    });
  });
};

export default NotificationScheduledService;
