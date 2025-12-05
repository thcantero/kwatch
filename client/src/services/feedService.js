import api from "./api";

// Get activity from users I follow
export const getMyFeed = async () => {
  const response = await api.get("/feed");
  return response.data.data;
};

// Get activity from everyone (Global)
export const getGlobalFeed = async () => {
  const response = await api.get("/feed/global");
  return response.data.data;
};