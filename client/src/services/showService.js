import api from "./api";

export const getPopularShows = async () => {
  const response = await api.get("/shows/popular");
  return response.data.data; 
};

export const searchShows = async (query) => {
  const response = await api.get(`/shows/search?q=${query}`);
  return response.data.data;
};

export const getShowDetails = async (id) => {
  const response = await api.get(`/shows/${id}`);
  return response.data.data;
};

export const toggleLike = async (showId) => {
  const response = await api.post(`/shows/${showId}/like`);
  return response.data.data;
};