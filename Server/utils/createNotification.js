import { notification } from "../models/notificationModel.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  entityId,
  workspaceId,
  createdBy,
}) => {
  try {
    await notification.create({
      userId,
      title,
      message,
      type,
      entityId,
      workspaceId,
      createdBy,
    });
  } catch (error) {
    console.error("Notification creation failed:", error);
  }
};
