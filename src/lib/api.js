import axios from "axios";

const PRIMARY_URL = process.env.REACT_APP_BACKEND_URL || "https://prephubbackend-production.up.railway.app";

const api = axios.create({
  baseURL: PRIMARY_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (
      status === 401 &&
      !url?.includes("/login") &&
      !url?.includes("/register") &&
      !url?.includes("/me")
    ) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const localApi = api;
export const PREP_BASE = PRIMARY_URL;
export const LOCAL_BASE = PRIMARY_URL;
export { api };
export default api;