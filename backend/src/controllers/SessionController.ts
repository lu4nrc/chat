import { Request, Response } from "express";
import AppError from "../errors/AppError";
import User from "../models/User"; // Import User model
import { getIO } from "../libs/socket"; // Import getIO

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(res, refreshToken);

  return res.status(200).json({
    token,
    user: serializedUser
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken, user });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const {userId}=req.params; // Using req.user.id as per refined plan
  const userId = req.user.id;

  if (userId) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        user.status = "offline"; // Update existing status to "offline"
        await user.save();

        const io = getIO();
        io.emit("user:status:updated", {
          userId: user.id, // or req.user.id, both should be same here
          status: "offline"
        });
      }
    } catch (error) {
      // Log error or handle, but don't let it break logout
      console.error("Error updating user status on logout:", error);
    }
  }

  res.clearCookie("jrt");
  return res.send();
};
