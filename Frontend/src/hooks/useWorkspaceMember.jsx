import { useEffect } from "react";
import { apiList } from "../common/apiList";
import {
    setWorkspaceMember,
    setIsWorkspaceMemberLoaded,
} from "../store/workspace.slice";
import Axios from "../utils/axios";

export const useWorkspaceMember = ({ currWorkspace, dispatch }) => {
    useEffect(() => {
        const fetchWorkspaceMembers = async () => {
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
        fetchWorkspaceMembers();
    }, [currWorkspace, dispatch])
};