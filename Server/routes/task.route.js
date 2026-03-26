import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createTask, getTasks } from "../controller/task.controller.js";
export const taskRouter = Router();

taskRouter.post("/create-task", auth, createTask);
taskRouter.post("/get-tasks", auth, getTasks);
