import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { logActivity } from "../utils/logActivity.js";
import { createNotification } from "../utils/createNotification.js";
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
      { new: true },
    );
    await projectModel.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          tasks: newTask._id,
        },
      },
      { new: true },
    );
    await userModel.updateMany(
      { _id: { $in: assignees } },
      {
        $addToSet: {
          task: newTask._id,
        },
      },
    );

    await logActivity({
      actorId: req.userId,
      action: "TASK_CREATED",
      entityType: "TASK",
      entityId: newTask._id,
      workspaceId,
      metadata: { projectId, assignees },
    });

    // Notify assignees
    for (const assigneeId of assignees) {
      await createNotification({
        userId: assigneeId,
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}`,
        type: "TASK",
        entityId: newTask._id,
        workspaceId,
        createdBy: req.userId,
      });
    }

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

export const getAllWorkspaceTasks = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Provide projectId",
      });
    }
    const tasks = await taskModel.find({ workspaceId });

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
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Provide projectId",
      });
    }
    const tasks = await taskModel.find({ projectId });

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

export const updateTask = async (req, res) => {
  try {
    const {
      taskId,
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

    const updatedTask = await taskModel.findByIdAndUpdate(
      taskId,
      {
        $set: {
          projectId,
          workspaceId,
          title,
          description,
          type,
          status,
          priority,
          dueDate,
          assignees,
        },
      },
      { new: true },
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await logActivity({
      actorId: req.userId,
      action: "TASK_UPDATED",
      entityType: "TASK",
      entityId: updatedTask._id,
      workspaceId,
      metadata: { projectId, title },
    });

    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        if (assigneeId.toString() !== req.userId) {
          await createNotification({
            userId: assigneeId,
            title: "Task Updated",
            message: `Task "${title}" has been updated`,
            type: "TASK",
            entityId: updatedTask._id,
            workspaceId,
            createdBy: req.userId,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Task Updated",
      data: updatedTask,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const addSubtask = async (req, res) => {
  try {
    const { taskId, title } = req.body;

    const updatedTask = await taskModel.findByIdAndUpdate(
      taskId,
      {
        $push: {
          subTasks: {
            title,
            isCompleted: false,
          },
        },
      },
      { new: true },
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await logActivity({
      actorId: req.userId,
      action: "SUBTASK_ADDED",
      entityType: "TASK",
      entityId: updatedTask._id,
      workspaceId: updatedTask.workspaceId,
      metadata: { subtaskTitle: title },
    });

    // Notify all assignees about subtask
    if (updatedTask.assignees && updatedTask.assignees.length > 0) {
      for (const assigneeId of updatedTask.assignees) {
        if (assigneeId.toString() !== req.userId) {
          await createNotification({
            userId: assigneeId,
            title: "Subtask Added",
            message: `A new subtask "${title}" has been added to task "${updatedTask.title}"`,
            type: "TASK",
            entityId: updatedTask._id,
            workspaceId: updatedTask.workspaceId,
            createdBy: req.userId,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Subtask added",
      data: updatedTask,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskId, message } = req.body;

    const updatedTask = await taskModel
      .findByIdAndUpdate(
        taskId,
        {
          $push: {
            comments: {
              userId,
              message,
            },
          },
        },
        { new: true },
      )
      .populate("comments.userId", "name");

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await logActivity({
      actorId: req.userId,
      action: "TASK_COMMENT_ADDED",
      entityType: "TASK",
      entityId: updatedTask._id,
      workspaceId: updatedTask.workspaceId,
      metadata: { comment: message },
    });

    // Notify all assignees about comment
    if (updatedTask.assignees && updatedTask.assignees.length > 0) {
      for (const assigneeId of updatedTask.assignees) {
        if (assigneeId.toString() !== req.userId) {
          await createNotification({
            userId: assigneeId,
            title: "New Comment on Task",
            message: `A new comment has been added to task "${updatedTask.title}"`,
            type: "TASK",
            entityId: updatedTask._id,
            workspaceId: updatedTask.workspaceId,
            createdBy: req.userId,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Comment added",
      data: updatedTask,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.body;

    const task = await taskModel.findById(taskId);

    const subtask = task.subTasks.id(subtaskId);

    subtask.isCompleted = !subtask.isCompleted;

    await task.save();

    await logActivity({
      actorId: req.userId,
      action: "SUBTASK_TOGGLED",
      entityType: "TASK",
      entityId: task._id,
      workspaceId: task.workspaceId,
      metadata: { subtaskId, isCompleted: subtask.isCompleted },
    });

    return res.status(200).json({
      success: true,
      message: "Subtask updated",
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
