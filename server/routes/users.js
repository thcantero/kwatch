//GET	/api/users/:id	- Get public profile (Name, Avatar, Bio).

//PUT	/api/users/profile	- Update my profile (Avatar, Bio). **(Protected)**

//GET	/api/users/:id/watchlist	- Get a user's entire watchlist (filter by ?status=watching).

//GET	/api/users/:id/stats	- Get stats (e.g., "Watched 150 hours", "Rom-Com Fan").

//POST	/api/users/:id/follow	- Follow this user. **(Protected)**

//DELETE	/api/users/:id/follow	- Unfollow this user. **(Protected)**

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require('../middleware/auth');
const { getUserProfile, updateProfile } = require('../controllers/userController');

// GET Public Profile
router.get('/:id', asyncHandler(getUserProfile));

// PUT Update Profile (Protected: Must be logged in)
// Note: We use /profile/me pattern or just verify the token matches
router.put('/profile', ensureLoggedIn, asyncHandler(updateProfile));

module.exports = router;