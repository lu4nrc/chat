import express from "express";
import isAuth from "../middleware/isAuth";

import * as DashboardController from "../controllers/DashboardController";

const DashboardRoutes = express.Router();

DashboardRoutes.get("/dashboard/today", isAuth, DashboardController.index);
DashboardRoutes.get("/dashboard/seven", isAuth, DashboardController.seven);
DashboardRoutes.get(
  "/dashboard/fourteen",
  isAuth,
  DashboardController.fourteen
);

export default DashboardRoutes;
