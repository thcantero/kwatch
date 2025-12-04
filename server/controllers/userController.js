const User = require("../models/User");
const { SuccessResponse } = require("../utils/responses");

// GET /api/users/:id
const getUserProfile = async (req, res) => {
    const user = await User.get(req.params.id);
    return new SuccessResponse("User profile", user).send(res);
};

// PUT /api/users/profile (Protected)
const updateProfile = async (req, res) => {
    // res.locals.user.id comes from the middleware
    const updatedUser = await User.update(res.locals.user.id, req.body);
    return new SuccessResponse("Profile updated", updatedUser).send(res);
};

module.exports = { getUserProfile, updateProfile };