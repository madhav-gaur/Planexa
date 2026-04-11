import multer from "multer";
import cloudinary from "./cloudinary.js";
import { CloudinaryStorage } from 'multer-storage-cloudinary';


const storage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `planexa/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 200, height: 200, crop: "fill" }],
    },
  });

  export const uploadAvatar = multer({ storage: storage("avatars") });
export const uploadWorkspaceLogo = multer({ storage: storage("workspace_logos") });
