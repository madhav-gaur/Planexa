import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getWorkspaceSummary } from "../controller/report.controller.js";

export const reportRouter = Router();

reportRouter.get("/summary", auth, getWorkspaceSummary);
