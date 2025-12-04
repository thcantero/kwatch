// POST /api/auth/register - Creates a new user (hashes password)

// POST /api/auth/login - Verifies credentials & returns a JWT token

// GET /api/auth/me - Validates the current token (used on page refresh)

const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { register, login } = require("../controllers/authController");

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

module.exports = router;