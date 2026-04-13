import { notification } from "../models/notificationModel.js";
import { taskModel } from "../models/taskModel.js";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

const formatDueDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const ensureNotification = async ({
  userId,
  entityId,
  workspaceId,
  title,
  message,
}) => {
  const exists = await notification.findOne({
    userId,
    entityId,
    title,
  });

  if (exists) return;

  await notification.create({
    userId,
    entityId,
    workspaceId,
    title,
    message,
    type: "TASK",
  });
};

export const syncDeadlineNotifications = async (userId) => {
  const now = new Date();
  const tasks = await taskModel.find({
    assignees: userId,
    isActive: true,
    status: { $ne: "DONE" },
    dueDate: { $ne: null },
  });

  for (const task of tasks) {
    const dueAt = new Date(task.dueDate);
    const msUntilDue = dueAt.getTime() - now.getTime();
    const dueLabel = formatDueDate(dueAt);

    if (msUntilDue < 0) {
      await ensureNotification({
        userId,
        entityId: task._id,
        workspaceId: task.workspaceId,
        title: "Task overdue",
        message: `"${task.title}" is overdue. It was due on ${dueLabel}.`,
      });
      continue;
    }

    if (msUntilDue <= REMINDER_WINDOW_MS) {
      await ensureNotification({
        userId,
        entityId: task._id,
        workspaceId: task.workspaceId,
        title: "Task reminder",
        message: `"${task.title}" is due on ${dueLabel}.`,
      });
    }
  }
};
