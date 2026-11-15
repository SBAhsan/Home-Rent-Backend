import multer from "multer";
import { AppError } from "../utils/app-error.js";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new AppError("Only JPG, PNG or WEBP images are allowed", 400));
      return;
    }
    cb(null, true);
  },
});