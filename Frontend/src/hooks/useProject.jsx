import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/axios";
import { apiList } from "../common/apiList";

import React from 'react'
import { setIsProjectLoaded, setIsProjectLoading, setProjects } from "../store/project.slice";

export const useProject = () => {
    const dispatch = useDispatch();
    const { isProjectLoaded } = useSelector((state) => state.project);
    const { currWorkspace } = useSelector(state => state.workspace)

    useEffect(() => {
        if (!currWorkspace._id) return
        const getProjects = async () => {
            try {
                dispatch(setIsProjectLoading(true))
                const response = await Axios({
                    ...apiList.getProjects,
                    data: {
                        workspaceId: currWorkspace?._id
                    }
                })
                console.log(response)
                if (response.data.success) {
                    dispatch(setProjects(response.data.data))
                }
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setIsProjectLoading(false))
                dispatch(setIsProjectLoaded(true))
            }
        }
        if (!isProjectLoaded) {
            getProjects()
        }


    }, [currWorkspace?._id, dispatch, isProjectLoaded])
}
