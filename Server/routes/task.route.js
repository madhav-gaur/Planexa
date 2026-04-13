import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  addComment,
  addSubtask,
  archiveTask,
  createTask,
  getAllWorkspaceTasks,
  getTasks,
  toggleSubtask,
  updateTask,
  uploadTaskAttachmentFile,
} from "../controller/task.controller.js";
import { uploadTaskAttachment } from "../utils/multer.js";
export const taskRouter = Router();

taskRouter.post("/create-task", auth, createTask);
taskRouter.post("/get-all-workspace-tasks", auth, getAllWorkspaceTasks);
taskRouter.post("/get-tasks", auth, getTasks);
taskRouter.post("/update-task", auth, updateTask);
taskRouter.post("/add-comment", auth, addComment);
taskRouter.post("/add-subtask", auth, addSubtask);
taskRouter.post("/toggle-subtask", auth, toggleSubtask);
taskRouter.patch("/:taskId/archive", auth, archiveTask);
taskRouter.post(
  "/:taskId/attachments",
  auth,
  uploadTaskAttachment.single("attachment"),
  uploadTaskAttachmentFile,
);
