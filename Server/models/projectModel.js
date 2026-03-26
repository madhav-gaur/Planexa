import mongoose from "mongoose";
const projectSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.ObjectId,
      ref: "workspace",
    },
    projectHeadId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
  },
    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"],
      default: "PLANNING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    tasks: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "task",
      },
    ],
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    labels: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
export const projectModel = mongoose.model("project", projectSchema);
