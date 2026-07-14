import axios from "axios";

// Both backend URLs — primary is your current active deployment
const PRIMARY_URL = process.env.REACT_APP_BACKEND_URL || "https://prephub-backend-z464.onrender.com";
const FALLBACK_URL = "https://prephub-backend.up.railway.app"; // your Railway deployment

// Single shared axios instance — talks to our FastAPI (which proxies the PrepHub
// Node.js backend for /api/prep/* and /api/notes/*, and serves /api/chat directly).
const api = axios.create({
  baseURL: PRIMARY_URL,
  withCredentials: true,
  timeout: 8000, // fail fast so fallback kicks in instead of hanging
});

// Track whether we've already failed over, so we don't flip-flop mid-session
let usingFallback = false;

function switchToFallback() {
  if (!usingFallback) {
    console.warn("Primary backend unreachable — switching to fallback.");
    api.defaults.baseURL = FALLBACK_URL;
    usingFallback = true;
  }
}

// ✅ intercept every response globally
// if backend returns 401 (token blacklisted or expired), redirect to login
// excludes auth routes to prevent infinite redirect loop
// also handles network/timeout errors by retrying once on the fallback backend
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const isNetworkOrTimeout = !error.response; // no response = network error, timeout, CORS block, or server down

    // --- Failover logic ---
    if (isNetworkOrTimeout && !error.config._retried) {
      switchToFallback();
      error.config._retried = true;
      error.config.baseURL = FALLBACK_URL;
      try {
        return await api.request(error.config); // retry the same request on fallback
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    // --- Existing 401 handling ---
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