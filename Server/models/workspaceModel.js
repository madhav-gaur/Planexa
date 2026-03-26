import mongoose from "mongoose";
const workspaceSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      index:true,
      unique: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    projects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "project",
      },
    ],
    settings: {
      allowGuestAccess: {
        type: Boolean,
        default: true,
      },
      taskAutoAssign: {
        type: Boolean,
        default: true,
      },
      maxProjects: {
        type: Number,
        default: 20,
      },
      maxMembers: {
        type: Number,
        default: 100,
      },
      allowFileUploads: {
        type: Boolean,
        default: true,
      },
      allowSubtasks: {
        type: Boolean,
        default: true,
      },
      allowComments: {
        type: Boolean,
        default: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
export const workspaceModel = mongoose.model("workspace", workspaceSchema);
