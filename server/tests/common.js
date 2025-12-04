const { db } = require("../config/db");
const User = require("../models/User");
// FIX 1: Import directly from utils, NOT controller
const { createToken } = require("../utils/tokens"); 

async function commonBeforeAll() {
  // Clear tables - Order matters because of Foreign Keys!
  await db.query("DELETE FROM shows_genres");
  await db.query("DELETE FROM shows_actors");
  await db.query("DELETE FROM reviews");
  await db.query("DELETE FROM watchlist");
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM shows");
  await db.query("DELETE FROM actors");
  await db.query("DELETE FROM genres");

  // Create a default test user
  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "u1@email.com",
    password: "password1",
    isAdmin: false
  });

  // Create an admin test user
  await User.register({
    username: "admin",
    firstName: "AdminF",
    lastName: "AdminL",
    email: "admin@email.com",
    password: "password1",
    isAdmin: true
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN"); // Start transaction
}

async function commonAfterEach() {
  await db.query("ROLLBACK"); // Rollback changes so tests don't affect each other
}

async function commonAfterAll() {
  await db.end(); // Close connection to stop Jest from hanging
}

// FIX 2: Complete the helper function to actually return a token
async function createTestToken(username="u1") {
    // We need to fetch the user by username to get their ID
    const res = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    const user = res.rows[0];
    return createToken(user);
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  createTestToken // Export this so tests can use it
};