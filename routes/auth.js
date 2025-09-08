const express = require('express');
const router = express.Router();

// POST /auth/register - Create a new user (Save to DB)

// POST /auth/login - Verify credentials, return JWT

// POST /auth/logout - User logout 

// GET /auth/me - Get current user profile
router.get('/', (req, res) => {
    res.json({message: "Endpoint"})
});

// GET /profile        → Get user data (from DB)

// PUT /profile        → Update user data (save to DB)

module.exports = router;

