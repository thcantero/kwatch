const User = require("../models/User");
const Watchlist = require("../models/Watchlist"); 
const Follow = require("../models/Follow");      
const Like = require("../models/Like");
const { NotFoundResponse, SuccessResponse } = require("../utils/responses");

// GET /api/users/:id
const getUserProfile = async (req, res) => {
    const user = await User.get(req.params.id);
    return new SuccessResponse("User profile", user).send(res);
};

// PUT /api/users/profile (Protected)
const updateProfile = async (req, res) => {
    const updatedUser = await User.update(res.locals.user.id, req.body);
    return new SuccessResponse("Profile updated", updatedUser).send(res);
};

// GET /api/users/:id/watchlist
const getWatchlist = async (req, res) => {
    const userId = req.params.id;
    const list = await Watchlist.list(userId);
    return new SuccessResponse("User watchlist retrieved", list).send(res);
};

// GET /api/users/:id/following
const getFollowing = async (req, res) => {
    const userId = req.params.id;
    const following = await Follow.getFollowing(userId);
    return new SuccessResponse("User following list retrieved", following).send(res);
};

// GET /api/users/:id/likes
const getUserLikes = async (req, res) => {
    const userId = req.params.id;
    const likes = await Like.getUserLikes(userId);
    return new SuccessResponse("User likes retrieved", likes).send(res);
};

// GET /api/users/:id/followers (optional - for completeness)
const getFollowers = async (req, res) => {
    const userId = req.params.id;
    const followers = await Follow.getFollowers(userId);
    return new SuccessResponse("User followers retrieved", followers).send(res);
};

/** GET /api/users/:id/stats */
const getUserStats = async (req, res, next) => {
    try {
        const stats = await User.getUserStats(req.params.id);
        if (!stats) {
            // Should usually return 0s, but just in case
            return next(new NotFoundResponse("Stats not found"));
        }
        res.json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
};

module.exports = { 
    getUserProfile, 
    updateProfile,
    getWatchlist,     
    getFollowing,     
    getUserLikes,
    getFollowers,
    getUserStats,     
};