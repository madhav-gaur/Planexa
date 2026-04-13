import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { logActivity } from "../utils/logActivity.js";
import { createNotification } from "../utils/createNotification.js";
import mongoose from "mongoose";
import { syncProjectProgress } from "../utils/projectProgress.js";
import { ensureWorkspaceExists, getWorkspaceRules } from "../utils/workspaceRules.js";
export const createProject = async (req, res) => {
  try {
    const {
      workspaceId,
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      projectHeadId,
      members,
      labels,
    } = req.body;
    if (!workspaceId || !name || !projectHeadId || !startDate || !endDate) {
      return res.status(401).json({
        success: false,
        message: "Provide all required Feilds",
      });
    }
    const workspace = await getWorkspaceRules(workspaceId);
    if (!ensureWorkspaceExists(workspace, res)) return;

    const activeProjectCount = await projectModel.countDocuments({
      workspaceId,
      isActive: true,
    });
    if (activeProjectCount >= workspace.settings.maxProjects) {
      return res.status(400).json({
        success: false,
        message: `Project limit reached for this workspace (${workspace.settings.maxProjects})`,
      });
    }

    const newProject = await projectModel.create({
      workspaceId,
      projectHeadId,
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      members,
      labels,
    });
    await workspaceModel.findByIdAndUpdate(
      workspaceId,
      {
        $addToSet: {
          projects: newProject._id,
        },
      },
      { new: true },
    );
    await userModel.findByIdAndUpdate(
      projectHeadId,
      {
        $addToSet: {
          project: newProject._id,
        },
      },
      { new: true },
    );

    await logActivity({
      actorId: req.userId,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: newProject._id,
      workspaceId,
      metadata: { projectHeadId, name },
    });

    const workspaceWithMembers = await workspaceModel
      .findById(workspaceId)
      .populate("members", "name email");
    for (const member of workspaceWithMembers?.members || []) {
      if (member._id.toString() !== req.userId) {
        await createNotification({
          userId: member._id,
          title: "New Project Created",
          message: `A new project "${name}" has been created in workspace "${workspaceWithMembers.name}"`,
          type: "PROJECT",
          entityId: newProject._id,
          workspaceId,
          createdBy: req.userId,
        });
      }
    }
    await syncProjectProgress(newProject._id);
    return res.status(200).json({
      success: true,
      message: "Project Created",
      data: newProject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: true,
        message: "Provide workspaceId",
      });
    }
    const workspace = await workspaceModel
      .findById(workspaceId)
      .populate("projects");

    if (!workspace) {
      return res.status(404).json({
        success: true,
        message: "Workspace not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Projects Fetched",
      data: workspace.projects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      workspaceId,
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      labels,
      projectHeadId,
      projectLead,
      members,
    } = req.body;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }
    const headId = projectHeadId !== undefined ? projectHeadId : projectLead;

    const updatePayload = {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      labels,
      members,
    };
    if (headId !== undefined) {
      updatePayload.projectHeadId = headId;
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      updatePayload,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await logActivity({
      actorId: req.userId,
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: updatedProject._id,
      workspaceId,
      metadata: { projectId, name },
    });
    if (updatedProject.members && updatedProject.members.length > 0) {
      for (const member of updatedProject.members) {
        if (member.toString() !== req.userId) {
          await createNotification({
            userId: member,
            title: "Project Updated",
            message: `Project "${name}" has been updated`,
            type: "PROJECT",
            entityId: updatedProject._id,
            workspaceId,
            createdBy: req.userId,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.body;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      {
        $pull: { members: new mongoose.Types.ObjectId(memberId) },
      },
      { new: true },
    );
    await userModel.findByIdAndUpdate(memberId, {
      $pull: { project: new mongoose.Types.ObjectId(projectId) },
    });

    await logActivity({
      actorId: req.userId,
      action: "PROJECT_MEMBER_REMOVED",
      entityType: "PROJECT",
      entityId: projectId,
      workspaceId: project.workspaceId,
      metadata: { targetUserId: memberId },
    });

    return res.status(200).json({
      success: true,
      message: "Member deleted Successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await projectModel.findByIdAndDelete(projectId);

    await userModel.updateMany(
      { project: projectId },
      { $pull: { project: projectId } },
    );

    await taskModel.deleteMany({ projectId });

    await workspaceModel.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } },
    );

    await logActivity({
      actorId: req.userId,
      action: "PROJECT_DELETED",
      entityType: "PROJECT",
      entityId: projectId,
      workspaceId: project.workspaceId,
      metadata: {},
    });

    return res.status(200).json({
      success: true,
      message: "Project Deleted",
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
