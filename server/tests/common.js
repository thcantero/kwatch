const { db } = require("../config/db");
const User = require("../models/User");
const { createToken } = require("../utils/tokens"); 

async function commonBeforeAll() {
  // Clear tables - Order matters because of Foreign Keys!
  await db.query(`
    TRUNCATE 
      users, 
      shows, 
      genres, 
      actors, 
      watchlist, 
      reviews, 
      shows_genres, 
      shows_actors 
    RESTART IDENTITY CASCADE
  `);

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
  try {
    // In test environment, we need to manually close connections
    if (process.env.NODE_ENV === 'test') {
      // First, check if there are any active connections
      const result = await db.query(`
        SELECT pid, query, state 
        FROM pg_stat_activity 
        WHERE datname = current_database()
        AND state = 'idle'
      `);
      
      // Kill any idle connections (optional but helpful)
      for (const row of result.rows) {
        try {
          await db.query(`SELECT pg_terminate_backend($1)`, [row.pid]);
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Close the pool
      await db.end();
    }
  } catch (err) {
    console.warn("Warning during test cleanup:", err.message);
    // In test environment, force exit if cleanup fails
    if (process.env.NODE_ENV === 'test') {
      setTimeout(() => process.exit(0), 1000);
    }
  }
}

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
  createTestToken
};