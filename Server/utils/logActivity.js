import { activityModel } from "../models/activityModel.js";

export const logActivity = async ({
  actorId,
  action,
  entityType,
  entityId,
  workspaceId,
  metadata = {},
}) => {
  try {
    console.log("Activity model started")
    await activityModel.create({
      actorId,
      action,
      entityType,
      entityId,
      workspaceId,
      metadata,
    });
  } catch (error) {
    console.error("Activity log failed:", error);
  }
};
