import axios from "axios";
import { apiList } from "../common/apiList";
import { useNavigate } from "react-router-dom";

const resolvedBaseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000/api";

const Axios = axios.create({
  baseURL: resolvedBaseURL.endsWith("/api")
    ? resolvedBaseURL
    : `${resolvedBaseURL}/api`,
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
        await Axios({
          ...apiList.refreshToken,
          withCredentials: true,
        });
        return Axios(originalRequest);
      } catch (err) {
        console.log(err);
        const navigate = useNavigate();
        const status = error.response?.status;

        if (status === 403) {
          navigate("/forbidden");
        } else if (status === 429) {
          navigate("/too-many-requests");
        } else if (status === 500) {
          navigate("/error");
        } else if (status === 503) {
          navigate("/maintenance");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default Axios;
