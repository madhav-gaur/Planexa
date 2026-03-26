import { Router } from "express";
import { refreshToken } from "../controller/refreshToken.controller.js";
import { upload } from "../config/multer.js";
import { auth } from "../middleware/auth.js";

export const refreshTokenRouter = Router();

refreshTokenRouter.post("/refresh-token", refreshToken);
