import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getActivities } from "../controller/activity.controller.js";

export const activityRouter = Router();

activityRouter.get("/", auth, getActivities);
