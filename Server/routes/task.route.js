import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { addComment, addSubtask, createTask, getTasks, toggleSubtask, updateTask } from "../controller/task.controller.js";
export const taskRouter = Router();

taskRouter.post("/create-task", auth, createTask);
taskRouter.post("/get-tasks", auth, getTasks);
taskRouter.post("/update-task", auth, updateTask);
taskRouter.post("/add-comment", auth, addComment);
taskRouter.post("/add-subtask", auth, addSubtask);
taskRouter.post("/toggle-subtask", auth, toggleSubtask);