import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/axios";
import { apiList } from "../common/apiList";

import React from 'react'
import { setIsProjectLoaded, setIsProjectLoading, setProjects } from "../store/project.slice";

export const useProject = () => {
    const dispatch = useDispatch();
    const { isProjectLoaded } = useSelector(state => state.project);
    const { currWorkspace } = useSelector(state => state.workspace);

    useEffect(() => {
        if (!currWorkspace._id || isProjectLoaded) return;

        const getProjects = async () => {
            dispatch(setIsProjectLoading(true));

            try {
                const response = await Axios({
                    ...apiList.getProjects,
                    data: { workspaceId: currWorkspace._id }
                }); 

                if (response.data.success) {
                    dispatch(setProjects(response.data.data));
                }
            } finally {
                dispatch(setIsProjectLoading(false));
                dispatch(setIsProjectLoaded(true));
            }
        };

        getProjects();
    }, [isProjectLoaded, currWorkspace._id, dispatch]);
};