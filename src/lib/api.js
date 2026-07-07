import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Single shared axios instance — talks to our FastAPI (which proxies the PrepHub
// Node.js backend for /api/prep/* and /api/notes/*, and serves /api/chat directly).
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// ✅ intercept every response globally
// if backend returns 401 (token blacklisted or expired), redirect to login
// excludes auth routes to prevent infinite redirect loop
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
export const PREP_BASE = BACKEND_URL;
export const LOCAL_BASE = BACKEND_URL;
export { api };
export default api;