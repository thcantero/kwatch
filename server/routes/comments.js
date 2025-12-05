const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { ensureLoggedIn } = require("../middleware/auth");
const { deleteComment } = require("../controllers/commentController");

// Secure all routes in this file
router.use(ensureLoggedIn);

// DELETE /api/v1/comments/:id
// (We only need the ID of the comment to delete it)
router.delete("/:id", asyncHandler(deleteComment));

module.exports = router;