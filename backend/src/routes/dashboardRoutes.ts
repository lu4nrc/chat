import express from "express";
import isAuth from "../middleware/isAuth";

import * as DashboardController from "../controllers/DashboardController";

const DashboardRoutes = express.Router();

DashboardRoutes.get("/dashboard/today", isAuth, DashboardController.index);


export default DashboardRoutes;
