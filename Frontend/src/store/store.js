import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user.slice.js";
import workspaceReducer from "./workspace.slice.js";
import projectReducer from "./project.slice.js";
import taskReducer from "./task.slice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    task: taskReducer,
  },
});
