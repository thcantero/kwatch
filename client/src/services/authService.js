import api from "./api";

// Matches POST /api/v1/auth/register
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data; 
};

// Matches POST /api/v1/auth/login
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Matches GET /api/v1/auth/me (If you implemented this route)
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};