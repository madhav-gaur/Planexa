import { toast } from "react-toastify";
import { apiList } from "../common/apiList";
import Axios from "./axios";

export const fetchNotifications = async ({
  pageNum = 1,
  setNotifications,
  setHasMore,
  setLoading,
}) => {
  try {
    setLoading?.(true);
    const response = await Axios({
      ...apiList.getNotifications,
      params: { page: pageNum, limit: 20 },
    });
    if (response.data.success) {
      const newNotifications = response.data.data;
      if (pageNum === 1) {
        setNotifications?.(newNotifications);
      } else {
        setNotifications?.((prev) => [...prev, ...newNotifications]);
      }
      setHasMore?.(newNotifications.length === 20);
      return newNotifications;
    }
  } catch (error) {
    console.error("Fetch notifications error:", error);
    toast.error("Failed to load notifications");
    return [];
  } finally {
    setLoading?.(false);
  }
};
