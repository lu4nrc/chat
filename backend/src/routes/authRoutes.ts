import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";

const authRoutes = Router();

authRoutes.post("/signup", UserController.store);

authRoutes.post("/reset", UserController.reset);

authRoutes.post("/login", SessionController.store);

authRoutes.post("/refresh_token", SessionController.update);

authRoutes.delete("/logout/:userId", isAuth, SessionController.remove);

export default authRoutes;
