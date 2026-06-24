import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Single shared axios instance — talks to our FastAPI (which proxies the PrepHub
// Node.js backend for /api/prep/* and /api/notes/*, and serves /api/chat directly).
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const localApi = api;
export const PREP_BASE = BACKEND_URL;
export const LOCAL_BASE = BACKEND_URL;
export { api };
export default api;
