const jwt = require("jsonwebtoken");

function createToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin || false
    };
    return jwt.sign(payload, process.env.SECRET_KEY);
}

module.exports = { createToken };