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

    useEffect(() => {
        if (isWorkspaceLoaded) return;

        const getWorkspaces = async () => {
            try {
                dispatch(setIsWorkspaceLoading(true));
                const response = await Axios({ ...apiList.getWorkspaces });

                if (response.data.success) {
                    const data = response.data.data;
                    dispatch(setWorkspaces(data));

                    const savedId = localStorage.getItem(CURR_WORKSPACE_STORAGE_KEY);
                    const selected = data.find(w => w._id === savedId) || data[0] || {};
                    dispatch(setCurrWorkspace(selected));

                    if (selected._id) {
                        localStorage.setItem(CURR_WORKSPACE_STORAGE_KEY, selected._id);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                dispatch(setIsWorkspaceLoaded(true));
                dispatch(setIsWorkspaceLoading(false));
            }
        };

        getWorkspaces();
    }, [isWorkspaceLoaded, dispatch]);
};