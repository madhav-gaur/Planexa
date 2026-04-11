import { apiList } from "../common/apiList";
import {
  setWorkspaceMember,
  setIsWorkspaceMemberLoaded,
} from "../store/workspace.slice";
import Axios from "./axios";

export const getWorkspaceMembers = async ({ currWorkspace, dispatch }) => {
  // Do not mark "loaded" without a workspace id — otherwise the fetch never runs
  // after currWorkspace is set (App effect sees isWorkspaceMemberLoaded already true).
  if (!currWorkspace?._id) {
    return;
  }
  try {
    const response = await Axios({
      ...apiList.getWorkspaceMembers,
      data: {
        workspaceId: currWorkspace._id,
      },
    });
    if (response.data.success) {
      dispatch(setWorkspaceMember(response.data.data));
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setIsWorkspaceMemberLoaded(true));
  }
};