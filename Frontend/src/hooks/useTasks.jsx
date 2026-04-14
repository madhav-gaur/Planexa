import React, { useEffect } from 'react'
import { apiList } from "../common/apiList";
import {
    setIsTaskLoaded,
    setIsTaskLoading,
    setTasks,
} from "../store/task.slice";
import Axios from "../utils/axios";

export const useTasks = ({ currProject, dispatch }) => {
    useEffect(() => {
        const getTasks = async () => {
            try {
                dispatch(setIsTaskLoading(true));

                const response = await Axios({
                    ...apiList.getTasks,
                    data: {
                        projectId: currProject?._id,
                    },
                });

                if (response.data.success) {
                    dispatch(setTasks(response.data.data));
                    dispatch(setIsTaskLoaded(true));
                }
            } catch (error) {
                console.error(error);
            } finally {
                dispatch(setIsTaskLoading(false));
            }
        };
        getTasks()
    }, [currProject?._id, dispatch])
}
