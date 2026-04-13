import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";

export const calculateProjectProgress = async (projectId) => {
  const [totalTasks, completedTasks] = await Promise.all([
    taskModel.countDocuments({ projectId, isActive: true }),
    taskModel.countDocuments({ projectId, isActive: true, status: "DONE" }),
  ]);

  if (!totalTasks) return 0;
  return Math.floor((completedTasks / totalTasks) * 100);
};

export const syncProjectProgress = async (projectId) => {
  if (!projectId) return null;
  const progress = await calculateProjectProgress(projectId);
  return projectModel.findByIdAndUpdate(
    projectId,
    { progress },
    { new: true, runValidators: true },
  );
};
