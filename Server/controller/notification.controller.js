import { notification } from "../models/notificationModel.js";
import { syncDeadlineNotifications } from "../utils/syncDeadlineNotifications.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    await syncDeadlineNotifications(userId);

    const notifications = await notification
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "name email")
      .populate("workspaceId", "name");

    const total = await notification.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    if (notificationId === "all") {
      await notification.updateMany(
        { userId, isRead: false },
        { isRead: true },
      );
    } else {
      await notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
      );
    }

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as read",
    });
  }
};
