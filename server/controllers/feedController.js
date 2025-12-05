const Feed = require("../models/Feed");
const { SuccessResponse } = require("../utils/responses");

// GET /api/v1/feed
const getFollowedFeed = async (req, res) => {
    // Requires login (ensureLoggedIn middleware handles this)
    const currentUserId = res.locals.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const feed = await Feed.getFollowedFeed(currentUserId, limit);
    
    return new SuccessResponse("Followed user feed retrieved", feed).send(res);
};

// GET /api/v1/feed/global
const getGlobalFeed = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const feed = await Feed.getGlobalFeed(limit);
    
    return new SuccessResponse("Global feed retrieved", feed).send(res);
};

module.exports = {
    getFollowedFeed,
    getGlobalFeed,
};