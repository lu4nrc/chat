import AppError from "../../errors/AppError";
import Scheduled from "../../models/Scheduled";
import { Op } from "sequelize";
interface Request {
  date?: Date;
  searchParams?: String;
  number?: string;
}
const ShowScheduleService = async ({
  date,
  number,
  searchParams
}: Request): Promise<Array<Scheduled>> => {
  var whereCondition;
  if (date) {
    var startDate = new Date(date);
    var endDate = new Date(date);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    whereCondition = {
      startDate: {
        [Op.gt]: startDate,
        [Op.lte]: endDate
      }
    };
  }
  if (searchParams) {
    whereCondition = {
      title: {
        [Op.like]: `%${searchParams}%`
      }
    };
  }

  if (number) {
    var data = new Date();
    const initial = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    ).setUTCHours(0, 0, 0, 0);
    whereCondition = {
      startDate: {
        [Op.gte]: initial
      }
    };
  }
  var scheduleds = await Scheduled.findAll({
    where: whereCondition,
    order: [["startDate", "DESC"]]
  });
  if (!scheduleds) {
    throw new AppError("NOT_FOUND_SCHEDULEDS");
  }
  //criar nova query para melhorar o desempenho
  if (number) {
    scheduleds = scheduleds.filter(function (element) {
      return element.externals.some(function (subElement) {
        return subElement.number === number;
      });
    });
  }
  return scheduleds;
};

export default ShowScheduleService;
