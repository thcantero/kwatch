const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");
const { createToken } = require("../utils/tokens");

let u1Token, u2Token;
let testReviewId;

beforeAll(async () => {
  // 1. Clean DB (The "Nuclear" Option)
  await db.query(`
    TRUNCATE 
      users, shows, reviews, review_likes, likes 
    RESTART IDENTITY CASCADE
  `);

  // 2. Create Users (Required for Foreign Keys)
  // We insert them manually to ensure IDs are 1 and 2
  await db.query(`
    INSERT INTO users (username, password_hash, name, email)
    VALUES 
    ('u1', 'hash', 'User One', 'u1@email.com'),
    ('u2', 'hash', 'User Two', 'u2@email.com')
  `);

  u1Token = createToken({ id: 1, username: 'u1', isAdmin: false });
  u2Token = createToken({ id: 2, username: 'u2', isAdmin: false });

  // 3. Create a Show
  await db.query(`
    INSERT INTO shows (tmdb_id, title, media_type, popularity)
    VALUES (99999, 'Like Test Show', 'movie', 100.0)
  `);

  // 4. Create a Review (by u2)
  const reviewRes = await db.query(`
    INSERT INTO reviews (user_id, show_id, rating, content)
    VALUES (2, 1, 8, 'Review to be liked')
    RETURNING id
  `);
  testReviewId = reviewRes.rows[0].id;
});

afterAll(async () => {
  await db.end();
});

describe("Review Like Routes (Toggle)", function () {

  /** POST /api/v1/reviews/:id/like */
  
  test("works: toggle ON (Like)", async function () {
    const resp = await request(app)
      .post(`/api/v1/reviews/${testReviewId}/like`)
      .set("Authorization", `Bearer ${u1Token}`);

    // Expect 200 OK (Not 201)
    expect(resp.statusCode).toEqual(200);
    // Check the 'action' property returned by your Like model
    expect(resp.body.data.action).toEqual("liked");
    
    // Verify DB
    const check = await db.query("SELECT * FROM review_likes WHERE user_id = 1");
    expect(check.rows.length).toEqual(1);
  });

  test("works: toggle OFF (Unlike)", async function () {
    // 1. U1 likes it again (hitting the same endpoint)
    const resp = await request(app)
      .post(`/api/v1/reviews/${testReviewId}/like`)
      .set("Authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);
    // Should now be unliked
    expect(resp.body.data.action).toEqual("unliked");

    // Verify DB is empty
    const check = await db.query("SELECT * FROM review_likes WHERE user_id = 1");
    expect(check.rows.length).toEqual(0);
  });

  test("works: different users interact independently", async function () {
    // U1 likes
    await request(app)
      .post(`/api/v1/reviews/${testReviewId}/like`)
      .set("Authorization", `Bearer ${u1Token}`);

    // U2 likes (same review)
    await request(app)
      .post(`/api/v1/reviews/${testReviewId}/like`)
      .set("Authorization", `Bearer ${u2Token}`);

    // Both should exist
    const check = await db.query("SELECT * FROM review_likes");
    expect(check.rows.length).toEqual(2);
  });

  test("404 if review does not exist", async function () {
    const resp = await request(app)
      .post(`/api/v1/reviews/0/like`)
      .set("Authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(404);
  });
});