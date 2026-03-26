import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    workspaces: [
      {
        workspaceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "workspace",
          required: true,
        },

        role: {
          type: String,
          enum: ["ADMIN","CONTRIBUTOR", "VIEWER"],
          default: "VIEWER",
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    project: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "project",
      },
    ],
    task: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "task",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
export const userModel = mongoose.model("user", userSchema);
