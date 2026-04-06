import mongoose from "mongoose";
import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { generateInviteLink } from "../utils/generateInviteLink.js";
import { verifyInviteHash } from "../utils/verifyInviteLink.js";

export const createWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(req.body);
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
    // console.log(req.body);
    const { workspaceId } = req.body;
    // console.log("id", workspaceId);
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
    const { workspaceId, role } = verifyInviteHash(token);

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
            role: role || "MEMBER",
            joinedAt: new Date(),
            isActive: true,
          },
        },
      },
    );

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

    await userModel.findOneAndUpdate(
      {
        _id: memberId,
        "workspaces.workspaceId": new mongoose.Types.ObjectId(workspaceId),
      },
      { $set: { "workspaces.$.role": newRole } },
    );

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
