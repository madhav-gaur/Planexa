import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";

export const getWorkspaceSummary = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required",
      });
    }

    const now = new Date();
    const [projects, tasks] = await Promise.all([
      projectModel.find({ workspaceId, isActive: true }).select(
        "status progress endDate",
      ),
      taskModel.find({ workspaceId, isActive: true }).select(
        "status priority dueDate completedAt",
      ),
    ]);

    const projectStatus = {
      PLANNING: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
      CANCELLED: 0,
    };
    const taskStatus = {
      TO_DO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };
    const taskPriority = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    for (const project of projects) {
      if (projectStatus[project.status] !== undefined) {
        projectStatus[project.status] += 1;
      }
    }

    for (const task of tasks) {
      if (taskStatus[task.status] !== undefined) {
        taskStatus[task.status] += 1;
      }
      if (taskPriority[task.priority] !== undefined) {
        taskPriority[task.priority] += 1;
      }
    }

    const overdueTasks = tasks.filter(
      (task) => task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < now,
    ).length;

    const completedThisWeek = tasks.filter((task) => {
      if (!task.completedAt) return false;
      const diff = now.getTime() - new Date(task.completedAt).getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const averageProgress = projects.length
      ? Math.round(
          projects.reduce((sum, project) => sum + (project.progress || 0), 0) /
            projects.length,
        )
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          projects: projects.length,
          completedProjects: projectStatus.COMPLETED,
          tasks: tasks.length,
          overdueTasks,
        },
        projectStatus,
        taskStatus,
        taskPriority,
        insights: {
          averageProgress,
          completedThisWeek,
        },
      },
    });
  } catch (error) {
    console.error("Get workspace summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace summary",
    });
  }
};
