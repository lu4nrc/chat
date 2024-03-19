import AppError from "../../errors/AppError";

import Scheduled from "../../models/Scheduled";


interface Request {

    startDate: Date, endDate: Date, externals: Array<Object>, anfitriao: string, attendants: Array<Object>, title: string, locale: string, description: string, typeEvent: number, recorrency: number, level: number, notificationType: Array<number>, datesNotify: Array<Date>, status:string,id: string
}

const UpdateScheduledService = async ({
    startDate, endDate, externals, anfitriao, attendants, title, locale, description, typeEvent, recorrency, level, notificationType, datesNotify,status, id
}: Request): Promise<void> => {


    const scheduled = await Scheduled.findOne({
        where: { id: id },
    });
    if (!scheduled) {
        throw new AppError("ERR_NO_SCHEDULED_FOUND", 404);
    }

    try {
        await scheduled.update({
            startDate, endDate, externals, anfitriao, attendants, title, locale, description, typeEvent, recorrency, level, notificationType, datesNotify,status
        });
    } catch (e) {
        throw new AppError("erro ao atualizar agendamento")
    }

};

export default UpdateScheduledService;
