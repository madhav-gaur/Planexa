import { Router } from "express";
import { upload } from "../config/multer.js";
import { auth } from "../middleware/auth.js";
import {
  createWorkspace,
  getInviteLink,
  getWorkspaceMembers,
  getWorkspaces,
  joinWorkspace,
  removeWorkspaceMember,
  updateMemberRole,
  updateWorkspace,
  updateWorkspaceLogo,
  updateWorkspaceSettings,
} from "../controller/workspace.controller.js";
import { uploadWorkspaceLogo } from "../utils/multer.js";

export const workspaceRouter = Router();

workspaceRouter.post("/create", auth, createWorkspace);
workspaceRouter.get("/get-workspaces", auth, getWorkspaces);
workspaceRouter.post("/get-members", auth, getWorkspaceMembers);
workspaceRouter.post("/get-invite-link", auth, getInviteLink);
workspaceRouter.post("/join-workspace", auth, joinWorkspace);
workspaceRouter.post("/remove-workspace-member", auth, removeWorkspaceMember);
workspaceRouter.post("/update-member-role", auth, updateMemberRole);

workspaceRouter.put("/:workspaceId", auth, updateWorkspace);
workspaceRouter.patch("/:workspaceId/settings", auth, updateWorkspaceSettings);
workspaceRouter.post(
  "/:workspaceId/logo",
  auth,
  uploadWorkspaceLogo.single("logo"),
  updateWorkspaceLogo,
);
