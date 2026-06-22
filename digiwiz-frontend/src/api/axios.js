import axios from "axios";

const api = axios.create({
  // Looks for an environment variable first; otherwise, uses your live Render backend
  baseURL: import.meta.env?.VITE_API_URL || "https://project-managment-fotr.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
