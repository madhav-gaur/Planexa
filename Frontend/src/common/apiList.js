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
  getUser: {
    url: "/user/get-user",
    method: "get",
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
  joinWorkspace: {
    url: "/workspace/join-workspace",
    method: "post",
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
  getTasks: {
    url: "/task/get-tasks",
    method: "post",
  },
  //   login: {
  //     url: "/user/login",
  //     method: "post",
  //   },
};
