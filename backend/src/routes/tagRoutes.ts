import express from "express";
import isAuth from "../middleware/isAuth";

import * as TagController from "../controllers/TagController";


const tagRoutes = express.Router();

tagRoutes.get("/tags", isAuth, TagController.show);

tagRoutes.post("/tags", isAuth, TagController.store);

tagRoutes.delete("/tags/:tagId", isAuth, TagController.remove);

tagRoutes.put("/tags/:tagId", isAuth, TagController.update);

export default tagRoutes;
