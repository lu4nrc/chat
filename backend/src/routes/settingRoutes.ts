import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();

settingRoutes.get("/settings", SettingController.index);

// routes.get("/settings/:settingKey", isAuth, SettingsController.show);

// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);
settingRoutes.get("/openingHours", isAuth, SettingController.openingHours);
settingRoutes.put("/openingHours", isAuth, SettingController.openingHoursEdit);
export default settingRoutes;
