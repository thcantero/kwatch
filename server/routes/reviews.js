const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { ensureLoggedIn } = require("../middleware/auth");
const { 
    createReview, 
    getReview, 
    updateReview, 
    deleteReview 
} = require("../controllers/reviewController");
const { toggleReviewLike } = require("../controllers/likeController");
const { createComment, getReviewComments } = require("../controllers/commentController");

// --- PUBLIC ROUTES ---

// Get specific review
router.get("/:id", asyncHandler(getReview));

// Get comments for a review (Nested Resource)
// Route: GET /api/v1/reviews/:reviewId/comments
router.get("/:reviewId/comments", asyncHandler(getReviewComments));


// --- PROTECTED ROUTES ---
router.use(ensureLoggedIn);

router.post("/", asyncHandler(createReview));
router.put("/:id", asyncHandler(updateReview));
router.delete("/:id", asyncHandler(deleteReview));

// Toggle Like
router.post("/:reviewId/like", asyncHandler(toggleReviewLike));

// Post Comment (Nested Resource)
// Route: POST /api/v1/reviews/:reviewId/comments
router.post("/:reviewId/comments", asyncHandler(createComment));

module.exports = router;