import path from "path";
import multer from "multer";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      const fileName =
        path.parse(file.originalname).name + path.extname(file.originalname);
      return cb(null, fileName);
    }
  })
};
