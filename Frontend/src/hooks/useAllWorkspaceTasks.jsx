import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/axios";
import { apiList } from "../common/apiList";
import { setIsTaskLoaded, setIsTaskLoading, setTasks } from "../store/task.slice";

export const useAllWorkspaceTasks = () => {
    const dispatch = useDispatch();
    const { currWorkspace } = useSelector(state => state.workspace)
    const { isTaskLoaded } = useSelector((state) => state.task);

    useEffect(() => {
        if (!currWorkspace._id) return
        const getAllWorkspaceTasks = async () => {
            try {
                dispatch(setIsTaskLoading(true))
                const response = await Axios({
                    ...apiList.getAllWorkspaceTasks,
                    data: {
                        workspaceId: currWorkspace?._id
                    }
                })
                console.log(response)
                if (response.data.success) {
                    dispatch(setTasks(response.data.data))
                }
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setIsTaskLoading(false))
                dispatch(setIsTaskLoaded(true))
            }
        }
        if (!isTaskLoaded) {
            getAllWorkspaceTasks()
        }


    }, [currWorkspace?._id, dispatch, isTaskLoaded])
}
