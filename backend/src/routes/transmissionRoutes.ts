import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";

import uploadConfig from "../config/upload";
import * as TransmissionController from "../controllers/TransmissionController";

const upload = multer(uploadConfig);

const transmissionRoutes = express.Router();

transmissionRoutes.post("/transmission", isAuth, upload.array('medias'), TransmissionController.store);
transmissionRoutes.post("/transmission/update/:id", isAuth, upload.array('medias'), TransmissionController.update);
transmissionRoutes.get("/transmission", isAuth, TransmissionController.show);
transmissionRoutes.delete("/transmission/:id", isAuth, TransmissionController.remove);
transmissionRoutes.post("/transmission/send/:id", isAuth, TransmissionController.send);
export default transmissionRoutes;
