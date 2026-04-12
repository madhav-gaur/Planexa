import mongoose from "mongoose";
import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { generateInviteLink } from "../utils/generateInviteLink.js";
import { verifyInviteHash } from "../utils/verifyInviteLink.js";
import { logActivity } from "../utils/logActivity.js";
import { createNotification } from "../utils/createNotification.js";

const WORKSPACE_ROLES = ["ADMIN", "CONTRIBUTOR", "VIEWER"];

/** Maps invite UI "MEMBER" and legacy values onto user.workspaces.role enum. */
const normalizeInviteRole = (role) => {
  if (!role || role === "MEMBER") return "CONTRIBUTOR";
  if (WORKSPACE_ROLES.includes(role)) return role;
  return "VIEWER";
};

export const createWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, logo } = req.body;
    const newWorkspace = await workspaceModel.create({
      adminId: userId,
      name,
      description,
      logo,
      members: [userId],
    });
    await userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          workspaces: {
            workspaceId: newWorkspace._id,
            role: "ADMIN",
            joinedAt: new Date(),
            isActive: true,
          },
        },
      },
      { new: true },
    );

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_CREATED",
      entityType: "WORKSPACE",
      entityId: newWorkspace._id,
      workspaceId: newWorkspace._id,
      metadata: { name },
    });

    return res.status(200).json({
      success: true,
      message: "Workspace created",
      data: newWorkspace,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// ? Get all workspace of user
export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;
    const workspaces = await workspaceModel.find({
      $or: [{ adminId: userId }, { members: userId }],
    });
    return res.status(200).json({
      success: true,
      message: "Workspaces fetched",
      data: workspaces,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ? Get members in a workspace
export const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const members = await userModel.find({
      "workspaces.workspaceId": workspaceId,
    });

    return res.status(200).json({
      success: true,
      message: "Members fetched",
      data: members,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ?Generate invite link

export const getInviteLink = (req, res) => {
  const { workspaceId, role } = req.body;

  const token = generateInviteLink(workspaceId, role);

  const link = `${process.env.FRONTEND_URL}/invite/${token}`;

  res.json({
    success: true,
    link,
  });
};
// ?invite member

export const joinWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    const { token } = req.body;
    const { workspaceId, role: rawRole } = verifyInviteHash(token);
    const role = normalizeInviteRole(rawRole);

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "WorkspaceId required",
      });
    }
    const workspace = await workspaceModel.findById(workspaceId);

    const alreadyMember = workspace.members.some(
      (memb) => memb.toString() == userId,
    );
    if (alreadyMember) {
      return res.status(200).json({
        success: true,
        message: "Already a member",
        data: alreadyMember,
      });
    }

    workspace.members.push(userId);
    await workspace.save();

    await userModel.updateOne(
      { _id: userId },
      {
        $push: {
          workspaces: {
            workspaceId,
            role,
            joinedAt: new Date(),
            isActive: true,
          },
        },
      },
    );

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_MEMBER_JOINED",
      entityType: "WORKSPACE",
      entityId: workspaceId,
      workspaceId,
      metadata: { role },
    });

    const workspaceData = await workspaceModel.findById(workspaceId);
    const newMember = await userModel.findById(userId);
    if (workspaceData && workspaceData.adminId.toString() !== userId) {
      await createNotification({
        userId: workspaceData.adminId,
        title: "New Member Joined",
        message: `${newMember.name} has joined the workspace as ${role}`,
        type: "WORKSPACE",
        entityId: workspaceId,
        workspaceId,
        createdBy: userId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joined Workspace",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const removeWorkspaceMember = async (req, res) => {
  try {
    const { memberId, workspaceId } = req.body;
    if (!memberId || !workspaceId)
      return res.status(404).json({
        success: false,
        message: "Provide Workspce Id and Member Id",
      });

    const workspace = await workspaceModel.findById(workspaceId);

    if (memberId == workspace.adminId.toString()) {
      return res.status(401).json({
        success: false,
        message: "Can't remove Admin",
      });
    }
    await projectModel.findByIdAndUpdate(
      workspaceId,
      {
        $pull: { members: new mongoose.Types.ObjectId(memberId) },
      },
      { new: true },
    );

    await userModel.findByIdAndUpdate(memberId, {
      $pull: {
        workspaces: { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
      },
    });
    await projectModel.updateMany(
      { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
      { $pull: { members: new mongoose.Types.ObjectId(memberId) } },
    );

    await taskModel.updateMany(
      { workspaceId: new mongoose.Types.ObjectId(workspaceId) },
      { $pull: { assignees: new mongoose.Types.ObjectId(memberId) } },
    );
    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_MEMBER_REMOVED",
      entityType: "WORKSPACE",
      entityId: workspaceId,
      workspaceId,
      metadata: { targetUserId: memberId },
    });

    // Notify removed member
    const removedMember = await userModel.findById(memberId);
    if (removedMember && workspace) {
      await createNotification({
        userId: memberId,
        title: "Removed from Workspace",
        message: `You have been removed from workspace "${workspace.name}"`,
        type: "WORKSPACE",
        entityId: workspaceId,
        workspaceId,
        createdBy: req.userId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member Removed from Workspace",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { memberId, workspaceId, newRole } = req.body;
    if (!memberId || !workspaceId || !newRole)
      return res.status(404).json({
        success: false,
        message: "Provide workspceId, memberId and newRole",
      });

    const roleToSet = normalizeInviteRole(newRole);
    if (!WORKSPACE_ROLES.includes(roleToSet)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    await userModel.findOneAndUpdate(
      {
        _id: memberId,
        "workspaces.workspaceId": new mongoose.Types.ObjectId(workspaceId),
      },
      { $set: { "workspaces.$.role": roleToSet } },
    );

    // Notify member about role change
    const memberUser = await userModel.findById(memberId);
    const workspaceInfo = await workspaceModel.findById(workspaceId);
    if (memberUser && workspaceInfo) {
      await createNotification({
        userId: memberId,
        title: "Role Updated",
        message: `Your role in workspace "${workspaceInfo.name}" has been changed to ${roleToSet}`,
        type: "WORKSPACE",
        entityId: workspaceId,
        workspaceId,
        createdBy: req.userId,
      });
    }

    await logActivity({
      actorId: req.userId,
      action: "UPDATED_ROLE",
      entityType: "WORKSPACE",
      entityId: workspaceId,
      workspaceId,
      metadata: { targetUserId: memberId, newRole: roleToSet },
    });

    return res.status(200).json({
      success: true,
      message: "Role Updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const userIsWorkspaceAdmin = async (userId, workspace) => {
  if (!workspace) return false;
  if (workspace.adminId?.toString() === userId.toString()) return true;
  const user = await userModel.findById(userId).select("workspaces");
  const entry = user?.workspaces?.find(
    (w) => w.workspaceId.toString() === workspace._id.toString(),
  );
  return entry?.role === "ADMIN";
};

export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    if (!(await userIsWorkspaceAdmin(req.userId, workspace))) {
      return res.status(403).json({
        success: false,
        message: "Only workspace admins can update workspace details",
      });
    }

    const update = {};
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      update.name = trimmed;
    }
    if (description !== undefined) update.description = String(description);
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide name and/or description",
      });
    }

    const updated = await workspaceModel.findByIdAndUpdate(
      workspaceId,
      update,
      { new: true, runValidators: true },
    );

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_UPDATED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      workspaceId: workspace._id,
      metadata: { fields: Object.keys(update) },
    });

    return res.status(200).json({
      success: true,
      message: "Workspace updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateWorkspaceLogo = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    if (!(await userIsWorkspaceAdmin(req.userId, workspace))) {
      return res.status(403).json({
        success: false,
        message: "Only workspace admins can update the workspace logo",
      });
    }
    if (!req.file?.path) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const logoUrl = req.file.path;
    const updated = await workspaceModel.findByIdAndUpdate(
      workspaceId,
      { logo: logoUrl },
      { new: true },
    );

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_LOGO_UPDATED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      workspaceId: workspace._id,
      metadata: {},
    });

    return res.status(200).json({
      success: true,
      message: "Logo updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const SETTINGS_KEYS = [
  "allowGuestAccess",
  "taskAutoAssign",
  "maxProjects",
  "maxMembers",
  "allowFileUploads",
  "allowSubtasks",
  "allowComments",
];

export const updateWorkspaceSettings = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    if (!(await userIsWorkspaceAdmin(req.userId, workspace))) {
      return res.status(403).json({
        success: false,
        message: "Only workspace admins can change workspace settings",
      });
    }

    const $set = {};
    for (const key of SETTINGS_KEYS) {
      if (req.body[key] === undefined) continue;
      if (key === "maxProjects" || key === "maxMembers") {
        const n = Number(req.body[key]);
        if (!Number.isFinite(n) || n < 1 || n > 10000) {
          return res.status(400).json({
            success: false,
            message: `${key} must be between 1 and 10000`,
          });
        }
        $set[`settings.${key}`] = n;
      } else {
        $set[`settings.${key}`] = Boolean(req.body[key]);
      }
    }

    if (Object.keys($set).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings fields provided",
      });
    }

    const updated = await workspaceModel.findByIdAndUpdate(
      workspaceId,
      { $set },
      { new: true, runValidators: true },
    );

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_SETTINGS_UPDATED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      workspaceId: workspace._id,
      metadata: { keys: Object.keys($set) },
    });

    return res.status(200).json({
      success: true,
      message: "Workspace settings updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
//
// export const template = async (req, res) => {
//   try {
//     return res.status(200).json({
//       success: true,
//       message: "",
//       data: "",
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };
