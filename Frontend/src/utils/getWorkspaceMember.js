import { apiList } from "../common/apiList"
import { setWorkspaceMember } from "../store/workspace.slice"
import Axios from "./axios"

  export const getWorkspaceMembers = async ({currWorkspace, dispatch}) => {
    try {
      const response = await Axios({
        ...apiList.getWorkspaceMembers,
        data: {
          workspaceId: currWorkspace?._id
        }
      })
      if (response.data.success) {
        dispatch(setWorkspaceMember(response.data.data))
      }
    } catch (error) {
      console.error(error)
    }
  }