import { Router } from "express";
import {
  getUser,
  userSignIn,
  userSignUp,
} from "../controller/user.controller.js";
import { upload } from "../config/multer.js";
import { auth } from "../middleware/auth.js";
export const userRouter = Router();

userRouter.post("/sign-up", upload.none(), userSignUp);
userRouter.post("/sign-in", upload.none(), userSignIn);
userRouter.get("/get-user", auth, getUser);