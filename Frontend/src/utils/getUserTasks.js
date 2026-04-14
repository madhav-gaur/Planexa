import { apiList } from "../common/apiList";
import Axios from "./axios";

export const getUserTasks = async ({ workspaceId, userId }) => {
  try {
    const response = await Axios({
      ...apiList.getAllWorkspaceTasks,
      data: {
        workspaceId,
        userId,
      },
    });

    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
};
