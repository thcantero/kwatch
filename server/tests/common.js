"use strict";

const { db } = require("../config/db");
const User = require("../models/User");
const { createToken } = require("../utils/tokens"); 
const bcrypt = require("bcrypt");

async function commonBeforeAll() {
  // ✅ FIX: Added comments, review_likes, likes, follows
  await db.query(`
    TRUNCATE 
      users, 
      shows, 
      genres, 
      actors, 
      watchlist, 
      reviews, 
      shows_genres, 
      shows_actors,
      comments,
      review_likes,
      likes,
      follows
    RESTART IDENTITY CASCADE
  `);

  // Use raw SQL to create users fast and safely
  const hashedPassword = await bcrypt.hash("password1", 1);
  
  await db.query(`
    INSERT INTO users (username, password_hash, name, email, is_admin)
    VALUES 
    ('u1', $1, 'U1F U1L', 'u1@email.com', false),
    ('admin', $1, 'AdminF AdminL', 'admin@email.com', true)
  `, [hashedPassword]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

async function createTestToken(username="u1") {
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