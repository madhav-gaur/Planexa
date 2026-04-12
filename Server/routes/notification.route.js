import { Router } from "express";
import {
  getNotifications,
  markAsRead,
} from "../controller/notification.controller.js";
import { auth } from "../middleware/auth.js";

export const notificationRouter = Router();

notificationRouter.get("/get", auth, getNotifications);
notificationRouter.patch("/:notificationId/read", auth, markAsRead);

export default notificationRouter;
