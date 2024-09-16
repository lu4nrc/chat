import multer from "multer";
import path from "path";

// Define onde os arquivos serão armazenados e o nome do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// Função para aceitar apenas certos tipos de arquivos, como imagens
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/gif"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."));
  }
};

// Configurações do upload
const upload = multer({
  storage,
  fileFilter,
  /* limits: {
    fileSize: 2 * 1024 * 1024 // Limite de 2MB
  } */
});

export default upload;
