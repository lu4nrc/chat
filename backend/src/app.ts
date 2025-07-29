import "reflect-metadata";
import "express-async-errors";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import moment from "moment-timezone";

import "./database";
import routes from "./routes";
import AppError from "./errors/AppError";
import { logger } from "./utils/logger";
import uploadConfig from "./config/upload";

moment.tz.setDefault("America/Sao_Paulo");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res
      .status(err.statusCode)
      .json({ error: err.message, user: err.user });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
