import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import Scheduled from "../models/Scheduled";
import OpeningHours from "../models/OpeningHour";
import Tag from "../models/Tag";
import Transmission from "../models/Transmission";

// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,Scheduled,OpeningHours,
  Tag,
  Transmission
];

sequelize.addModels(models);

export default sequelize;
