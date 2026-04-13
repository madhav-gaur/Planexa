import { Router } from "express";
import {
  deleteAccount,
  forgotPassword,
  getUser,
  leaveWorkspace,
  resetPassword,
  updatePassword,
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
userRouter.post("/forgot-password", upload.none(), forgotPassword);
userRouter.post("/reset-password", upload.none(), resetPassword);
userRouter.get("/get-user", auth, getUser);

userRouter.post(
  "/upload-avatar",
  auth,
  uploadAvatar.single("avatar"),
  updateAvatar,
);
userRouter.post("/update-profile", auth, updateProfile);
userRouter.post("/update-password", auth, updatePassword);
userRouter.post("/leave-workspace", auth, leaveWorkspace);
userRouter.delete("/delete-account", auth, deleteAccount);
