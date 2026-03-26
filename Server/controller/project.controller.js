import { crossOriginResourcePolicy } from "helmet";
import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import mongoose from "mongoose";
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
    console.log(req.body);
    if (
      !workspaceId ||
      !name ||
      !projectHeadId ||
      !startDate ||
      !endDate
      //   members.length == 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Provide all required Feilds",
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
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      labels,
      projectLead,
      members,
    } = req.body;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }
    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      {
        name,
        description,
        status,
        priority,
        startDate,
        endDate,
        labels,
        projectLead,
        members,
      },
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
