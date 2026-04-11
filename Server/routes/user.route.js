import { Router } from "express";
import {
  getUser,
  updateAvatar,
  updateProfile,
  userSignIn,
  userSignUp,
} from "../controller/user.controller.js";
import { upload } from "../config/multer.js";
import { uploadAvatar } from "../utils/multer.js";
import { auth } from "../middleware/auth.js";
export const userRouter = Router();

userRouter.post("/sign-up", upload.none(), userSignUp);
userRouter.post("/sign-in", upload.none(), userSignIn);
userRouter.get("/get-user", auth, getUser);

userRouter.post(
  "/upload-avatar",
  auth,
  uploadAvatar.single("avatar"),
  updateAvatar,
);
userRouter.post("/update-profile", auth, updateProfile);
