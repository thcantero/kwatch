import axios from "axios";

// Access environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTOR ---
// Automatically adds the JWT Token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR  ---
// Global error handling (e.g., if token expires, auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, the token is invalid/expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login or trigger a global event
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;