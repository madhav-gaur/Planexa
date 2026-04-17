import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/axios";
import { apiList } from "../common/apiList";

import React from 'react'
import { setCurrWorkspace, setIsWorkspaceLoaded, setIsWorkspaceLoading, setWorkspaces } from "../store/workspace.slice";

export const useWorkspace = () => {
    const dispatch = useDispatch();
    const { isWorkspaceLoaded } = useSelector((state) => state.workspace);
    const CURR_WORKSPACE_STORAGE_KEY = "currWorkspaceId";
    const { currWorkspace } = useSelector(state => state.workspace)
    const {isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        const getWorkspaces = async () => {
            try {
                dispatch(setIsWorkspaceLoading(true))
                const response = await Axios({
                    ...apiList.getWorkspaces,
                })
                if (response) {
                    dispatch(setIsWorkspaceLoading(false))
                }
                if (response.data.success) {
                    let data = response.data.data
                    dispatch(setWorkspaces(data))
                    const savedWorkspaceId = localStorage.getItem(CURR_WORKSPACE_STORAGE_KEY)
                    const selectedWorkspace =
                        data.find((item) => item._id === savedWorkspaceId) || data[0] || {}
                    dispatch(setCurrWorkspace(selectedWorkspace))
                    dispatch(setIsWorkspaceLoaded(true))
                    if (isWorkspaceLoaded) {
                        dispatch(setIsWorkspaceLoading(false))
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setIsWorkspaceLoaded(true))
                dispatch(setIsWorkspaceLoading(false))
            }
        }
        if (currWorkspace?._id) {
            localStorage.setItem(CURR_WORKSPACE_STORAGE_KEY, currWorkspace._id)
        }
        if (!isWorkspaceLoaded && isAuthenticated) {
            getWorkspaces()
        }
    }, [isWorkspaceLoaded, dispatch, currWorkspace])

}
