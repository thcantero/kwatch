import api from "./api";

// Matches GET /api/v1/shows/:id/reviews (Defined in shows.js routes)
export const getReviewsByShow = async (showId) => {
  const response = await api.get(`/shows/${showId}/reviews`);
  return response.data.data;
};

// Matches POST /api/v1/reviews (Defined in reviews.js routes)
export const createReview = async (reviewData) => {
  // reviewData should be { showId, rating, content }
  const response = await api.post("/reviews", reviewData);
  return response.data.data;
};

// Matches POST /api/v1/reviews/:reviewId/like (Defined in reviews.js routes)
export const toggleReviewLike = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/like`);
  return response.data.data;
};