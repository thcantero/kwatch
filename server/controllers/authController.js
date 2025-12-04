const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { CreatedResponse, SuccessResponse } = require("../utils/responses");

// Helper to create token
const { createToken } = require("../utils/tokens");

const register = async (req, res) => {
    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return new CreatedResponse("User registered", { token, user: newUser }).send(res);
};

const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return new SuccessResponse("Welcome back!", { token, user }).send(res);
};

module.exports = { register, login };