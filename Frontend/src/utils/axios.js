import axios from "axios";
import { apiList } from "../common/apiList";
const Axios = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});
Axios.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await Axios(apiList.refreshToken, { withCredentials: true });
        return Axios(originalRequest);
      } catch (err) {
        // logout
        console.log(err)
      }
    }

    return Promise.reject(error);
  }
);

export default Axios;
