import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createProject,
  deleteProject,
  getProjects,
  removeMember,
  updateProject,
} from "../controller/project.controller.js";
export const projectRouter = Router();

projectRouter.post("/create-project", auth, createProject);
projectRouter.post("/get-projects", auth, getProjects);
projectRouter.put("/update-project/:projectId", auth, updateProject);
projectRouter.put("/remove-member", auth, removeMember);
projectRouter.put("/delete-project", auth, deleteProject);