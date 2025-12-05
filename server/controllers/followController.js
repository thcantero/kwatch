const Follow = require("../models/Follow");
const { SuccessResponse, BadRequestResponse} = require("../utils/responses");

// POST /api/v1/users/:id/follow
const followUser = async (req, res) => {
    const followerId = res.locals.user.id;
    const followedId = parseInt(req.params.id);
    const result = await Follow.follow(followerId, followedId);
    return new SuccessResponse("Follow successful", result).send(res);
};

// DELETE /api/v1/users/:id/follow
const unfollowUser = async (req, res) => {
    const followerId = res.locals.user.id;
    const followedId = parseInt(req.params.id);
    const result = await Follow.unfollow(followerId, followedId);
    return new SuccessResponse("Unfollow successful", result).send(res);
};

module.exports = {
    followUser,
    unfollowUser
};