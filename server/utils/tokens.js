const jwt = require("jsonwebtoken");

function createToken(user) {
    const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

    const payload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin || false
    };
    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };