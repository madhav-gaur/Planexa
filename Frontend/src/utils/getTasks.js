import { apiList } from "../common/apiList";
import {
  setIsTaskLoaded,
  setIsTaskLoading,
  setTasks,
} from "../store/task.slice";
import Axios from "./axios";

export const getTasks = async ({ currProject, dispatch }) => {
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
