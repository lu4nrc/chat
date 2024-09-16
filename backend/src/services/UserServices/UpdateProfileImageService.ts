import path from "path";
import fs from "fs";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface UpdateProfileImageServiceData {
  imageUrl: string;
  userId: string;
}

const UpdateProfileImageService = async ({
  imageUrl,
  userId
}: UpdateProfileImageServiceData): Promise<void> => {
  // Busca o usuário pelo ID
  const user = await User.findByPk(userId);

  // Se o usuário não for encontrado, lança um erro
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Define o caminho completo onde a imagem será salva (pasta public/uploads)
  const imagePath = path.resolve(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    imageUrl
  );

  // Verifica se o arquivo existe antes de salvar
  if (!fs.existsSync(imagePath)) {
    throw new AppError("Image file not found", 404);
  }

  // Atualiza o campo da imagem de perfil no banco de dados com o caminho correto
  user.imageUrl = `/uploads/${imageUrl}`;

  // Salva as alterações no banco de dados
  await user.save();
};

export default UpdateProfileImageService;
