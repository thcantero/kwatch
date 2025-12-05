const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { ensureLoggedIn, ensureOptionalLogin} = require('../middleware/auth');
const { getPopularActors, getActorDetails, followActor, unfollowActor } = require('../controllers/actorController');

router.get('/popular', asyncHandler(getPopularActors));

// (The controller checks req.user safely anyway)
router.get('/:id', ensureOptionalLogin, asyncHandler(getActorDetails));

// Protected Routes
router.post('/:id/follow', ensureLoggedIn, asyncHandler(followActor));
router.delete('/:id/follow', ensureLoggedIn, asyncHandler(unfollowActor));

module.exports = router;
