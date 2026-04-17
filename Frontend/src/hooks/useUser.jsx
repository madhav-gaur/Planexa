import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsUserLoaded, setIsUserLoading, setUserDetails } from "../store/user.slice";
import Axios from "../utils/axios";
import { apiList } from "../common/apiList";

import React from 'react'
import { setIsWorkspaceLoaded } from "../store/workspace.slice";

export const useUser = () => {
    const dispatch = useDispatch();
    const { isUserLoaded, isAuthenticated } = useSelector((state) => state.user);
    console.log(isAuthenticated);
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                dispatch(setIsUserLoading(true))
                const response = await Axios({
                    ...apiList.getUser,
                })
                if (response) {
                    dispatch(setIsUserLoading(false))
                }
                if (response.data.success) {
                    let data = response.data.data
                    dispatch(setUserDetails(data))
                    dispatch(setIsWorkspaceLoaded(true))
                }
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setIsUserLoaded(true))
                dispatch(setIsUserLoading(false))
            }
        }
        if (!isUserLoaded && isAuthenticated ) {
            fetchUser()
        }
    }, [isUserLoaded, dispatch, isAuthenticated])

}
