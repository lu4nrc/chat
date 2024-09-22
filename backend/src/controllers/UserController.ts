import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import fs from "fs";
import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import ResetPassService from "../services/UserServices/ResetPassUserService";
import UpdateUserService from "../services/UserServices/UpdateUserService";

import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import UpdateProfileImageService from "../services/UserServices/UpdateProfileImageService";
import UpdateStatusUserService from "../services/UserServices/UpdateStatusUserService";
import UpdateDatetimeUserService from "../services/UserServices/UpdateDatetimeUserService";
import sharp from "sharp";
import path from "path";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { users, count, hasMore, usersId } = await ListUsersService({
    searchParam,
    pageNumber
  });

  return res.json({ users, count, hasMore, usersId });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, name, profile, queueIds, whatsappId, imageUrl } =
    req.body;

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }


  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    queueIds,
    whatsappId,
    imageUrl
  });

  const io = getIO();
  io.emit("user", {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const reset = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;
  await ResetPassService({ email });
  return res.status(200).json();
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { userId } = req.params;
  const userData = req.body;


  const user = await UpdateUserService({ userData, userId });

  const io = getIO();
  io.emit("user", {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const updateProfileImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  // Verifica se o arquivo foi enviado corretamente
  if (!req.file) {
    throw new AppError("ERR_NO_FILE_UPLOADED", 400);
  }

  const filePath = req.file.path; // Caminho do arquivo salvo pelo multer
  const compressedFilePath = path.resolve(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    `${Date.now()}-compressed-${req.file.originalname}`
  );

  try {
    // Processa e comprime a imagem com sharp
    const compressedBuffer = await sharp(filePath)
      .resize(Number(process.env.WIDTH) || 350, Number(process.env.HEIGHT) || 350, {
        fit: "inside",
        withoutEnlargement: true
      })
      .toFormat("jpeg", {
        progressive: true,
        quality: 90
      })
      .toBuffer();

    // Salva a imagem comprimida no lugar do arquivo original ou em outro caminho
    fs.writeFileSync(compressedFilePath, compressedBuffer);

    // Deleta a imagem original, se necessário
    fs.unlinkSync(filePath);

    // Cria a URL da imagem comprimida
    const imageUrl = path.basename(compressedFilePath);

    // Atualiza o perfil de usuário com a URL da nova imagem
    if (userId) await UpdateProfileImageService({ imageUrl, userId });

    return res
      .status(200)
      .json({ message: "Imagem de perfil atualizada com sucesso!", imageUrl });
  } catch (error) {
    console.error("Error processing image:", error.message);

    // Limpa o arquivo original se houver erro
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new AppError("ERR_PROCESSING_IMAGE", 500);
  }
};

export const updateTimer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  await UpdateDatetimeUserService({ userId });
  return res.status(200).json({});
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId);

  const io = getIO();
  io.emit("user", {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};
