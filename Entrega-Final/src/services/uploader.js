import multer from "multer";
import config from "../config.js";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = path.basename(req.path);
    // cb(null, "${config.DIRNAME}/${config.UPLOAD_DIR}")
    cb(null, `${config,UPLOAD_DIR}/${subfolder}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploader = multer({ storage: storage });
