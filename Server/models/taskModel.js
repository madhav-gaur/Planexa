import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
      required: true,
    },
    type: {
      type: String,
      enum: ["BUG", "FEATURE", "TASK", "IMPROVEMENT", "OTHER"],
      default: "TASK",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["TO_DO", "IN_PROGRESS", "DONE"],
      default: "TO_DO",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.ObjectId,
      ref: "workspace",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: "project",
      required: true,
    },
    assignees: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    labels: [String],

    completedAt: {
      type: Date,
      default: null,
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subTasks: [
      {
        title: String,
        isCompleted: Boolean,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
export const taskModel = mongoose.model("task", taskSchema);
