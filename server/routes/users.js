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
const { getUserProfile, updateProfile, getWatchlist, getFollowing, getUserLikes, getUserStats } = require('../controllers/userController');
const { followUser, unfollowUser } = require('../controllers/followController'); 

// GET Public Profile & Lists (No login required to view profile)
router.get('/:id/stats', asyncHandler(getUserStats));

router.get('/:id/following', asyncHandler(getFollowing));
router.get('/:id/likes', asyncHandler(getUserLikes));
router.get('/:id/watchlist', asyncHandler(getWatchlist))

router.get('/:id', asyncHandler(getUserProfile));


// --- PROTECTED ROUTES ---
router.put('/profile', ensureLoggedIn, asyncHandler(updateProfile)); // Update logged-in user's profile

// User-to-User Follows
router.post('/:id/follow', ensureLoggedIn, asyncHandler(followUser));
router.delete('/:id/follow', ensureLoggedIn, asyncHandler(unfollowUser));

module.exports = router;