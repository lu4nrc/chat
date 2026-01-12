import jwt, { SignOptions } from "jsonwebtoken";
import authConfig from "../config/auth";
import User from "../models/User";

export const createAccessToken = (user: User): string => {
  const { secret, expiresIn } = authConfig;

  return jwt.sign(
    {
      username: user.name, // corrigi o typo usarname → username
      profile: user.profile,
      id: user.id
    },
    secret as string,
    {
      expiresIn: expiresIn as SignOptions["expiresIn"]
    }
  );
};

export const createRefreshToken = (user: User): string => {
  const { refreshSecret, refreshExpiresIn } = authConfig;

  return jwt.sign(
    {
      id: user.id,
      tokenVersion: user.tokenVersion
    },
    refreshSecret as string,
    {
      expiresIn: refreshExpiresIn as SignOptions["expiresIn"]
    }
  );
};
