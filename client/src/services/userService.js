import api from "./api";

// Get public profile (Name, Bio, their Watchlist/Reviews)
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
};

// Follow a user
export const followUser = async (userId) => {
  const response = await api.post(`/users/${userId}/follow`);
  return response.data.data;
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  const response = await api.delete(`/users/${userId}/follow`);
  return response.data.data;
};

// Get list of people I am following (to check if I follow this person)
export const getMyFollowing = async (myUserId) => {
  const response = await api.get(`/users/${myUserId}/following`);
  return response.data.data;
};