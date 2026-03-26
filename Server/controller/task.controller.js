import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
export const createTask = async (req, res) => {
  try {
    const {
      workspaceId,
      projectId,
      title,
      type,
      description,
      status,
      priority,
      dueDate,
      assignees,
    } = req.body;
    console.log(req.body);
    if (!projectId || !title || assignees.length == 0 || !dueDate) {
      return res.status(401).json({
        success: false,
        message: "Provide all required Feilds",
      });
    }
    const newTask = await taskModel.create({
      projectId,
      workspaceId,
      title,
      description,
      type,
      status,
      priority,
      dueDate,
      assignees,
    });
    await workspaceModel.findByIdAndUpdate(
      workspaceId,
      {
        $addToSet: {
          tasks: newTask._id,
        },
      },
      { new: true }
    );
    await projectModel.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          tasks: newTask._id,
        },
      },
      { new: true }
    );
    await userModel.updateMany(
      { _id: { $in: assignees } },
      {
        $addToSet: {
          task: newTask._id,
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "Task Created",
      data: newTask,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Provide projectId",
      });
    }
    const tasks = await taskModel.find({projectId});

    if (!tasks) {
      return res.status(404).json({
        success: false,
        message: "Tasks not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks Fetched",
      data: tasks,
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
