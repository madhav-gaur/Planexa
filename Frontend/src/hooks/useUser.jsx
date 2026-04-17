import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsUserLoaded, setIsUserLoading, setUserDetails } from "../store/user.slice";
import Axios from "../utils/axios";
import { apiList } from "../common/apiList";
import { setIsWorkspaceLoaded } from "../store/workspace.slice";

export const useUser = () => {
    const dispatch = useDispatch();
    const { isUserLoaded } = useSelector((state) => state.user);

    useEffect(() => {
        if (isUserLoaded) return;

        const fetchUser = async () => {
            dispatch(setIsUserLoading(true));
            try {
                const response = await Axios({ ...apiList.getUser });

                if (response.data.success) {
                    dispatch(setUserDetails(response.data.data));
                    dispatch(setIsWorkspaceLoaded(true));
                }
            } catch (error) {
                console.error(error);
            } finally {
                dispatch(setIsUserLoaded(true));
                dispatch(setIsUserLoading(false));
            }
        };

        fetchUser();
    }, [isUserLoaded, dispatch]);
};