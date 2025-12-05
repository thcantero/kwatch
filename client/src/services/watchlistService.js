import api from "./api";

export const getWatchlist = async () => {
  const response = await api.get("/watchlist");
  return response.data.data;
};

export const addToWatchlist = async (showId, status = 'watching') => {
  const response = await api.post("/watchlist", { showId, status });
  return response.data.data;
};

export const updateWatchlistStatus = async (watchlistId, status) => {
  // Use the ID directly in the URL: router.put("/:showId", ...)
  const response = await api.put(`/watchlist/${watchlistId}`, { status });
  return response.data.data;
};

export const removeFromWatchlist = async (watchlistId) => {
  const response = await api.delete(`/watchlist/${watchlistId}`);
  return response.data.data;
};