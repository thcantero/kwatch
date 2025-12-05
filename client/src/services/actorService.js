import api from "./api";

export const getActorDetails = async (id) => {
  const response = await api.get(`/actors/${id}`);
  // SuccessResponse wrapper sends { success: true, message: "...", data: {...} }
  return response.data.data;
};