import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";
import { userModel } from "../models/userModel.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { logActivity } from "../utils/logActivity.js";
import { createNotification } from "../utils/createNotification.js";
import { syncProjectProgress } from "../utils/projectProgress.js";
import { ensureWorkspaceExists, getWorkspaceRules } from "../utils/workspaceRules.js";
import cloudinary from "../utils/cloudinary.js";
import { Readable } from "node:stream";
import { sendTaskAssignmentEmail } from "../utils/sendTaskEmail.js";

const normalizeTaskLabels = (labels = []) => {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => String(label).trim())
    .filter(Boolean)
    .filter((label, index, arr) => arr.indexOf(label) === index);
};

const resolveAttachmentResourceType = (mimetype = "") => {
  if (mimetype.startsWith("image/")) return "image";
  return "raw";
};

const getCompletedAtValue = (status, previousCompletedAt = null) => {
  if (status === "DONE") return previousCompletedAt || new Date();
  return null;
};

const formatDueDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "";

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
      assignees = [],
      labels = [],
    } = req.body;
    if (!projectId || !title || !dueDate) {
      return res.status(401).json({
        success: false,
        message: "Provide all required Feilds",
      });
    }
    const workspace = await getWorkspaceRules(workspaceId);
    if (!ensureWorkspaceExists(workspace, res)) return;

    const project = await projectModel.findById(projectId).select(
      "projectHeadId workspaceId",
    );
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const normalizedAssignees =
      Array.isArray(assignees) && assignees.length > 0
        ? assignees
        : workspace.settings.taskAutoAssign && project.projectHeadId
          ? [project.projectHeadId]
          : [];

    if (!workspace.settings.taskAutoAssign && normalizedAssignees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one assignee",
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
      assignees: normalizedAssignees,
      labels: normalizeTaskLabels(labels),
      completedAt: getCompletedAtValue(status),
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
      { _id: { $in: normalizedAssignees } },
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
      metadata: { projectId, assignees: normalizedAssignees },
    });

    const assignedUsers = await userModel.find({
      _id: { $in: normalizedAssignees },
    }).select("name email");

    // Notify assignees
    for (const assigneeId of normalizedAssignees) {
      await createNotification({
        userId: assigneeId,
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}`,
        type: "TASK",
        entityId: newTask._id,
        workspaceId,
        createdBy: req.userId,
      });

      const assignee = assignedUsers.find(
        (item) => item._id.toString() === assigneeId.toString(),
      );
      await sendTaskAssignmentEmail({
        email: assignee?.email,
        name: assignee?.name,
        taskTitle: title,
        dueDateLabel: formatDueDate(dueDate),
        taskLink: projectId
          ? `http://${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${newTask._id}`
          : undefined,
      });
    }
    await syncProjectProgress(projectId);

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
    const tasks = await taskModel.find({ workspaceId, isActive: true });

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
    const tasks = await taskModel.find({ projectId, isActive: true });

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
      assignees = [],
      labels = [],
    } = req.body;

    const existingTask = await taskModel.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

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
          labels: normalizeTaskLabels(labels),
          completedAt: getCompletedAtValue(status, existingTask.completedAt),
        },
      },
      { new: true },
    );

    await logActivity({
      actorId: req.userId,
      action: "TASK_UPDATED",
      entityType: "TASK",
      entityId: updatedTask._id,
      workspaceId,
      metadata: { projectId, title },
    });

    if (assignees && assignees.length > 0) {
      const newlyAssignedIds = assignees.filter(
        (assigneeId) =>
          !existingTask.assignees.some(
            (currentAssignee) =>
              currentAssignee.toString() === assigneeId.toString(),
          ),
      );
      const assignedUsers = await userModel.find({
        _id: { $in: newlyAssignedIds },
      }).select("name email");

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

      for (const assigneeId of newlyAssignedIds) {
        const assignee = assignedUsers.find(
          (item) => item._id.toString() === assigneeId.toString(),
        );
        await sendTaskAssignmentEmail({
          email: assignee?.email,
          name: assignee?.name,
          taskTitle: title,
          dueDateLabel: formatDueDate(dueDate),
          taskLink: projectId
            ? `http://${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${updatedTask._id}`
            : undefined,
        });
      }
    }
    await syncProjectProgress(projectId || updatedTask.projectId);

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
    const task = await taskModel.findById(taskId).select("workspaceId");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    const workspace = await getWorkspaceRules(task.workspaceId);
    if (!ensureWorkspaceExists(workspace, res)) return;
    if (!workspace.settings.allowSubtasks) {
      return res.status(400).json({
        success: false,
        message: "Subtasks are disabled for this workspace",
      });
    }

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
    const task = await taskModel.findById(taskId).select("workspaceId");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    const workspace = await getWorkspaceRules(task.workspaceId);
    if (!ensureWorkspaceExists(workspace, res)) return;
    if (!workspace.settings.allowComments) {
      return res.status(400).json({
        success: false,
        message: "Comments are disabled for this workspace",
      });
    }

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
export const archiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.isActive = false;
    await task.save();

    await Promise.all([
      workspaceModel.findByIdAndUpdate(task.workspaceId, {
        $pull: { tasks: task._id },
      }),
      projectModel.findByIdAndUpdate(task.projectId, {
        $pull: { tasks: task._id },
      }),
      userModel.updateMany(
        { task: task._id },
        { $pull: { task: task._id } },
      ),
    ]);

    await logActivity({
      actorId: req.userId,
      action: "TASK_ARCHIVED",
      entityType: "TASK",
      entityId: task._id,
      workspaceId: task.workspaceId,
      metadata: { projectId: task.projectId },
    });

    await syncProjectProgress(task.projectId);

    return res.status(200).json({
      success: true,
      message: "Task archived",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const uploadTaskAttachmentFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const workspace = await getWorkspaceRules(task.workspaceId);
    if (!ensureWorkspaceExists(workspace, res)) return;
    if (!workspace.settings.allowFileUploads) {
      return res.status(400).json({
        success: false,
        message: "File uploads are disabled for this workspace",
      });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "No attachment file provided",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "planexa/task_attachments",
          resource_type: resolveAttachmentResourceType(req.file.mimetype),
          use_filename: true,
          unique_filename: true,
          filename_override: req.file.originalname,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        },
      );

      Readable.from(req.file.buffer).pipe(stream);
    });

    task.attachments.push({
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
    });
    await task.save();

    await logActivity({
      actorId: req.userId,
      action: "TASK_ATTACHMENT_ADDED",
      entityType: "TASK",
      entityId: task._id,
      workspaceId: task.workspaceId,
      metadata: { fileName: req.file.originalname },
    });

    return res.status(200).json({
      success: true,
      message: "Attachment uploaded",
      data: task,
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
