const Comment = require("../models/Comment");
const { SuccessResponse, CreatedResponse, BadRequestResponse } = require("../utils/responses");

// POST /api/v1/reviews/:reviewId/comments
const createComment = async (req, res) => {
    const userId = res.locals.user.id;
    const reviewId = req.params.reviewId;
    const { content } = req.body;
    
    // Model handles existence check
    const comment = await Comment.create({ userId, reviewId, content });
    
    return new CreatedResponse("Comment created", comment).send(res);
};

// GET /api/v1/reviews/:reviewId/comments
const getReviewComments = async (req, res) => {
    const comments = await Comment.getByReview(req.params.reviewId);
    return new SuccessResponse("Comments retrieved", comments).send(res);
};

// DELETE /api/v1/comments/:id
const deleteComment = async (req, res) => {
    const userId = res.locals.user.id;
    const commentId = req.params.id;
    await Comment.remove(commentId, userId);
    return new SuccessResponse("Comment deleted").send(res);
};

module.exports = {
    createComment,
    getReviewComments,
    deleteComment,
};