import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as UserController from "../controllers/UserController";

import upload from "../middleware/upload"; 


const userRoutes = Router();

userRoutes.get("/users", isAuth, UserController.index);

userRoutes.post("/users", isAuth, UserController.store);

userRoutes.put("/users/:userId", isAuth, UserController.update);

userRoutes.put("/users/time/:userId", isAuth, UserController.updateTimer);

//userRoutes.put("/users/status/:userId", isAuth, UserController.updateStatus);

userRoutes.post("/users/profile-image/", upload.single("image"), UserController.updateProfileImage);

userRoutes.get("/users/:userId", isAuth, UserController.show);

userRoutes.delete("/users/:userId", isAuth, UserController.remove);

export default userRoutes;
