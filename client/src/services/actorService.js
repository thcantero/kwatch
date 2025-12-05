import api from "./api";

export const getActorDetails = async (id) => {
  const response = await api.get(`/actors/${id}`);
  // SuccessResponse wrapper sends { success: true, message: "...", data: {...} }
  return response.data.data;
};

export const followActor = async (actorId) => {
  const response = await api.post(`/actors/${actorId}/follow`);
  return response.data;
};

export const unfollowActor = async (actorId) => {
  const response = await api.delete(`/actors/${actorId}/follow`);
  return response.data;
};