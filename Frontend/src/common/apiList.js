export const baseURL = import.meta.env.VITE_API_URL;

export const apiList = {
  signUp: {
    url: "/user/sign-up",
    method: "post",
  },
  signIn: {
    url: "/user/sign-in",
    method: "post",
  },
  signOut: {
    url: "/user/sign-out",
    method: "post",
  },
  forgotPassword: {
    url: "/user/forgot-password",
    method: "post",
  },
  resetPassword: {
    url: "/user/reset-password",
    method: "post",
  },
  getUser: {
    url: "/user/get-user",
    method: "get",
  },
  updateAvatar: {
    url: "/user/upload-avatar",
    method: "post",
  },
  updateProfile: {
    url: "/user/update-profile",
    method: "post",
  },
  updatePassword: {
    url: "/user/update-password",
    method: "post",
  },
  leaveWorkspace: {
    url: "/user/leave-workspace",
    method: "post",
  },
  deleteAccount: {
    url: "/user/delete-account",
    method: "delete",
  },
  refreshToken: {
    url: "/auth/refresh-token",
    method: "post",
  },
  createWorkspace: {
    url: "/workspace/create",
    method: "post",
  },
  getWorkspaces: {
    url: "/workspace/get-workspaces",
    method: "get",
  },
  getWorkspaceMembers: {
    url: "/workspace/get-members",
    method: "post",
  },
  getInviteLink: {
    url: "/workspace/get-invite-link",
    method: "post",
  },
  sendInviteEmail: {
    url: "/workspace/send-invite-email",
    method: "post",
  },
  joinWorkspace: {
    url: "/workspace/join-workspace",
    method: "post",
  },
  removeWorkspaceMember: {
    url: "/workspace/remove-workspace-member",
    method: "post",
  },
  updateMemberRole: {
    url: "/workspace/update-member-role",
    method: "post",
  },
  updateWorkspace: {
    url: "/workspace",
    method: "put",
  },
  updateWorkspaceSettings: {
    url: "/workspace",
    method: "patch",
  },
  updateWorkspaceLogo: {
    url: "/workspace",
    method: "post",
  },
  deleteWorkspace: {
    url: "/workspace",
    method: "delete",
  },
  createProject: {
    url: "/project/create-project",
    method: "post",
  },
  updateProject: {
    url: "/project/update-project",
    method: "put",
  },
  removeMember: {
    url: "/project/remove-member",
    method: "put",
  },
  getProjects: {
    url: "/project/get-projects",
    method: "post",
  },
  deleteProject: {
    url: "/project/delete-project",
    method: "put",
  },
  createTask: {
    url: "/task/create-task",
    method: "post",
  },
  updateTask: {
    url: "/task/update-task",
    method: "post",
  },
  getTasks: {
    url: "/task/get-tasks",
    method: "post",
  },
  getAllWorkspaceTasks: {
    url: "/task/get-all-workspace-tasks",
    method: "post",
  },
  addComment: {
    url: "/task/add-comment",
    method: "post",
  },
  addSubtask: {
    url: "/task/add-subtask",
    method: "post",
  },
  toggleSubtask: {
    url: "/task/toggle-subtask",
    method: "post",
  },

  getNotifications: {
    method: "GET",
    url: "/notification/get",
  },
  markNotificationRead: {
    method: "PATCH",
    url: "/notification/:notificationId/read",
  },
  getActivities: {
    method: "GET",
    url: "/activity",
  },
  getWorkspaceSummary: {
    method: "GET",
    url: "/report/summary",
  },
  archiveTask: {
    method: "PATCH",
    url: "/task/:taskId/archive",
  },
  uploadTaskAttachment: {
    method: "POST",
    url: "/task/:taskId/attachments",
  },
};
