import { Router } from "express";
import { upload } from "../config/multer.js";
import { auth } from "../middleware/auth.js";
import { createWorkspace, getInviteLink, getWorkspaceMembers, getWorkspaces, joinWorkspace } from "../controller/workspace.controller.js";
export const workspaceRouter = Router();

workspaceRouter.post("/create", auth, createWorkspace);
workspaceRouter.get("/get-workspaces", auth, getWorkspaces);
workspaceRouter.post("/get-members", auth, getWorkspaceMembers);
workspaceRouter.post("/get-invite-link", auth, getInviteLink);
workspaceRouter.post("/join-workspace", auth, joinWorkspace);