const Review = require("../models/Review");
const { SuccessResponse, CreatedResponse, BadRequestResponse } = require("../utils/responses");

// POST /api/v1/reviews
const createReview = async (req, res) => {
    const userId = res.locals.user.id;
    const { showId, rating, content, containsSpoilers } = req.body;
    
    try {
        const review = await Review.create({ 
            userId, showId, rating, content, containsSpoilers 
        });
        
        return new CreatedResponse("Review posted", review).send(res);
    } catch (err) {
        // Handle duplicate review (Postgres Unique Violation 23505)
        if (err.code === '23505') {
            throw new BadRequestResponse("You have already reviewed this show");
        }
        throw err;
    }
};

// GET /api/v1/reviews/:id
const getReview = async (req, res) => {
    const review = await Review.get(req.params.id);
    return new SuccessResponse("Review details", review).send(res);
};

// PUT /api/v1/reviews/:id
const updateReview = async (req, res) => {
    const userId = res.locals.user.id;
    const updated = await Review.update(req.params.id, userId, req.body);
    return new SuccessResponse("Review updated", updated).send(res);
};

// DELETE /api/v1/reviews/:id
const deleteReview = async (req, res) => {
    const userId = res.locals.user.id;
    await Review.remove(req.params.id, userId);
    return new SuccessResponse("Review deleted").send(res);
};

// GET /api/v1/shows/:id/reviews
const getShowReviews = async (req, res) => {
    const reviews = await Review.getForShow(req.params.id);
    return new SuccessResponse("Show reviews retrieved", reviews).send(res);
};

module.exports = {
    createReview,
    getReview,
    updateReview,
    deleteReview,
    getShowReviews
};