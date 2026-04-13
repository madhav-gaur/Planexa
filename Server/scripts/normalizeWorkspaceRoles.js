import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/connectDb.js";
import { userModel } from "../models/userModel.js";

const normalizeRoles = async () => {
  await connectDB();

  const users = await userModel.find({ "workspaces.role": "MEMBER" });
  let updatedUsers = 0;

  for (const user of users) {
    let changed = false;
    user.workspaces = user.workspaces.map((workspace) => {
      if (workspace.role === "MEMBER") {
        changed = true;
        return { ...workspace.toObject(), role: "CONTRIBUTOR" };
      }
      return workspace;
    });

    if (changed) {
      updatedUsers += 1;
      await user.save();
    }
  }

  console.log(`Normalized workspace roles for ${updatedUsers} user(s).`);
  await mongoose.disconnect();
};

normalizeRoles().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
