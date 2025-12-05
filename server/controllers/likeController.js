const Like = require("../models/Like");
const { SuccessResponse } = require("../utils/responses");

// POST /api/v1/shows/:showId/like
const toggleShowLike = async (req, res) => {
    const userId = res.locals.user.id;
    const showId = req.params.showId;
    const result = await Like.toggleShowLike(userId, showId);
    return new SuccessResponse("Like status updated", result).send(res);
};

// POST /api/v1/reviews/:reviewId/like
const toggleReviewLike = async (req, res) => {
    const userId = res.locals.user.id;
    const reviewId = req.params.reviewId;
    const result = await Like.toggleReviewLike(userId, reviewId);
    return new SuccessResponse("Like status updated", result).send(res);
};

module.exports = {
    toggleShowLike,
    toggleReviewLike
};