//GET	/api/feed	- The "Home" Feed. Returns recent reviews or watchlist updates only from users the current user follows.

//GET	/api/feed/global	-A "Discover" feed showing recent activity from everyone (good for new users with no friends yet).

const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { ensureLoggedIn } = require("../middleware/auth");
const { 
    getFollowedFeed, 
    getGlobalFeed 
} = require("../controllers/feedController");

// Public: GET /api/v1/feed/global
router.get("/global", asyncHandler(getGlobalFeed));

// Protected: GET /api/v1/feed (Requires user ID to fetch followed activity)
router.get("/", ensureLoggedIn, asyncHandler(getFollowedFeed));

module.exports = router;