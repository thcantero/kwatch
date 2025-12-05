const Feed = require("../models/Feed");
const { SuccessResponse } = require("../utils/responses");

// GET /api/v1/feed
const getFollowedFeed = async (req, res, next) => {
    const currentUserId = res.locals.user.id;

    const feed = await Feed.getFollowedFeed(currentUserId);
    res.json({ success: true, data: feed });
};

// GET /api/v1/feed/global
const getGlobalFeed = async (req, res, next) => {
    const feed = await Feed.getGlobalFeed();
    res.json({ success: true, data: feed });
};

module.exports = {
    getFollowedFeed,
    getGlobalFeed,
};