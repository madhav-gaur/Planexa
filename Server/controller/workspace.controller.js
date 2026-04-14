import mongoose from "mongoose";
import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { generateInviteLink } from "../utils/generateInviteLink.js";
import { verifyInviteHash } from "../utils/verifyInviteLink.js";
import { logActivity } from "../utils/logActivity.js";
import { createNotification } from "../utils/createNotification.js";
import { sendWorkspaceInviteEmail } from "../utils/sendWorkspaceInviteEmail.js";

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

export const getInviteLink = async (req, res) => {
  try {
    const { workspaceId, role } = req.body;
    const workspace = await workspaceModel.findById(workspaceId).select(
      "settings members",
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    if (!workspace.settings.allowGuestAccess) {
      return res.status(400).json({
        success: false,
        message: "Guest access is disabled for this workspace",
      });
    }
    if (workspace.members.length >= workspace.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Workspace member limit reached (${workspace.settings.maxMembers})`,
      });
    }

    const token = generateInviteLink(workspaceId, role);
    const link = `${process.env.FRONTEND_URL}/invite/${token}`;

    return res.json({
      success: true,
      link,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// ?invite member

export const sendInviteEmail = async (req, res) => {
  try {
    const { workspaceId, email, role } = req.body;
    const userId = req.userId;

    const workspace = await workspaceModel.findById(workspaceId).select(
      "name settings members",
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    if (!workspace.settings.allowGuestAccess) {
      return res.status(400).json({
        success: false,
        message: "Guest access is disabled for this workspace",
      });
    }

    if (workspace.members.length >= workspace.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Workspace member limit reached (${workspace.settings.maxMembers})`,
      });
    }

    const existingMember = await userModel.findOne({
      email: email,
      "workspaces.workspaceId": workspaceId,
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this workspace",
      });
    }

    const token = generateInviteLink(workspaceId, role);
    const inviteLink = `http://${process.env.FRONTEND_URL}/invite/${token}`;

    const inviter = await userModel.findById(userId).select("name");

    await sendWorkspaceInviteEmail({
      email,
      workspaceName: workspace.name,
      inviterName: inviter?.name || "A team member",
      inviteLink,
      role: role,
    });

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_INVITE_SENT",
      entityType: "WORKSPACE",
      entityId: workspaceId,
      workspaceId,
      metadata: { targetEmail: email, role },
    });

    return res.json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

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
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    if (!workspace.settings.allowGuestAccess) {
      return res.status(400).json({
        success: false,
        message: "Guest access is disabled for this workspace",
      });
    }
    if (workspace.members.length >= workspace.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Workspace member limit reached (${workspace.settings.maxMembers})`,
      });
    }

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
    await workspaceModel.findByIdAndUpdate(
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

export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Check if user is the admin
    if (workspace.adminId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only workspace admin can delete the workspace",
      });
    }

    // Delete all related data
    // Delete projects and their tasks
    const projects = await projectModel.find({ workspaceId });
    for (const project of projects) {
      await taskModel.deleteMany({ projectId: project._id });
    }
    await projectModel.deleteMany({ workspaceId });

    // Delete all tasks in workspace
    await taskModel.deleteMany({ workspaceId });

    // Remove workspace from all members' workspaces array
    await userModel.updateMany(
      { "workspaces.workspaceId": workspaceId },
      { $pull: { workspaces: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } } }
    );

    // Delete the workspace
    await workspaceModel.findByIdAndDelete(workspaceId);

    await logActivity({
      actorId: req.userId,
      action: "WORKSPACE_DELETED",
      entityType: "WORKSPACE",
      entityId: workspaceId,
      workspaceId: null, // No workspace context since it's deleted
      metadata: { workspaceName: workspace.name },
    });

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

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
