import multer from "multer";
import cloudinary from "./cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `planexa/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 200, height: 200, crop: "fill" }],
    },
  });

const attachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "planexa/task_attachments",
    resource_type: "auto",
  }),
});

export const uploadAvatar = multer({ storage: storage("avatars") });
export const uploadWorkspaceLogo = multer({
  storage: storage("workspace_logos"),
});
export const uploadTaskAttachment = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});
