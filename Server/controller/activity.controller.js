import { activityModel } from "../models/activityModel.js";

export const getActivities = async (req, res) => {
  try {
    const { workspaceId, entityType, page = 1, limit = 20 } = req.query;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required",
      });
    }

    const numericPage = Number(page) || 1;
    const numericLimit = Math.min(Number(limit) || 20, 100);
    const query = { workspaceId };
    if (entityType) query.entityType = entityType;

    const activities = await activityModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .populate("actorId", "name email avatar")
      .populate("workspaceId", "name");

    const total = await activityModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    console.error("Get activities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
};
