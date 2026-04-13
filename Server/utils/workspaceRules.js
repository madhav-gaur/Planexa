import { workspaceModel } from "../models/workspaceModel.js";

export const getWorkspaceRules = async (workspaceId) => {
  if (!workspaceId) return null;
  return workspaceModel.findById(workspaceId).select("settings members adminId");
};

export const ensureWorkspaceExists = (workspace, res) => {
  if (workspace) return true;
  res.status(404).json({
    success: false,
    message: "Workspace not found",
  });
  return false;
};
