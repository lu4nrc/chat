import moment, { Moment } from "moment";
import DayOfWeek from "../models/DayOfWeek";
import OpeningHours from "../models/OpeningHour";

const CheckOpeningHours = async (initalDate: Date, acceptDate: Date): Promise<Date> => {
  const openingHours = await OpeningHours.findOne({
  });
  var days: DayOfWeek[] | undefined = openingHours?.days.filter((day) => day.index === acceptDate.getDay());
  var date: Moment = moment().tz("America/Sao_Paulo");
  var initDate: Moment = moment(new Date(initalDate)).tz("America/Sao_Paulo");
  var accept: Moment = moment(new Date(acceptDate)).tz("America/Sao_Paulo");
  //VERIFICA SE A DATA INICIAL É IGUAL A DATA DE ACEITE
  if (initDate.date() === accept.date()) {
    days?.forEach((day) => {
      let start1: Moment = moment(new Date(day.start1)).tz("America/Sao_Paulo");
      let start2: Moment = moment(new Date(day.start2)).tz("America/Sao_Paulo");
      let end1: Moment = moment(new Date(day.end1)).tz("America/Sao_Paulo");
      let end2: Moment = moment(new Date(day.end2)).tz("America/Sao_Paulo");
      //VERIFICA SE A DATA INICIAL ESTÁ DENTRO DO PRIMEIRO PERÍODO DE ATENDIMENTO
      if ((initDate.hour() >= start1.hour()) && (initDate.hour() <= end1.hour())) {
        date = initDate;
        //VERIFICA SE A DATA INICIAL ESTÁ DENTRO DO SEGUNDO PERÍODO DE ATENDIMENTO
      } else if ((initDate.hour() >= start2.hour()) && (initDate.hour() <= end2.hour())) {
        date = initDate;
      } else {
        //VERIFICA SE A DATA INICIAL ESTÁ ANTES DO PRIMEIRO PERÍODO DE ATENDIMENTO
        if ((initDate.hour() <= end1.hour())) {
          date = moment(new Date(accept.year(), accept.month(), accept.date(), start1.hour(), start1.minute()));
          //VERIFICA SE A DATA INICIAL ESTÁ DEPOIS DO PRIMEIRO PERÍODO DE ATENDIMENTO
        } else if ((initDate.hour() <= end2.hour()) && (initDate.hour() >= end1.hour())) {
          date = moment(new Date(accept.year(), accept.month(), accept.date(), start2.hour(), start2.minute()));
          //VERIFICA SE A DATA INICIAL ESTÁ DEPOIS DO SEGUNDO PERÍODO DE ATENDIMENTO
        } else {
          date = accept;
        }
      }
    });
  } else {
    //VERIFICA SE A DATA DE ACEITE É DIFERENTE DA DATA INICIAL
    days?.forEach((day) => {
      let start1 = moment(new Date(day.start1)).tz("America/Sao_Paulo");
      if (day.index === accept.day()) {
        date = moment(new Date(accept.year(), accept.month(), accept.date(), start1.hour(), start1.minute()));
      } else {
        date = accept;
      }
    });
  }
  days?.forEach((day) => {
    let start1: Moment = moment(new Date(day.start1)).tz("America/Sao_Paulo");
    let start2: Moment = moment(new Date(day.start2)).tz("America/Sao_Paulo");
    let end1: Moment = moment(new Date(day.end1)).tz("America/Sao_Paulo");
    let end2: Moment = moment(new Date(day.end2)).tz("America/Sao_Paulo");
    //VERIFICA SE A DATA DE ACEITE ESTÁ DENTRO DO PRIMEIRO PERÍODO DE ATENDIMENTO &&  //VERIFICA SE A DATA DE ACEITE ESTÁ DENTRO DO SEGUNDO PERÍODO DE ATENDIMENTO
    if (((accept.hour() >= start1.hour()) && (accept.hour() <= end1.hour()))
      ||
      ((accept.hour() >= start2.hour()) && (accept.hour() <= end2.hour()))
    ) {
      return;
    } else {
      date = accept;
    }
  })
  return new Date(date.utc().format('Y-MM-DD HH:mm:ss.SSS Z'));
};

export default CheckOpeningHours;

