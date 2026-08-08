import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT as a Bearer header on every request. Auth is header-based (not a
// cookie) so it survives the cross-site frontend/API split where browsers block
// third-party cookies.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
