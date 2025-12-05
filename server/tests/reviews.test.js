const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  createTestToken
} = require("./common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Review Routes", function () {
  let u1Token;
  let u2Token;
  let testShowId;
  let testReviewId;

  // Setup: Create users, tokens, a show, and one initial review
  beforeAll(async () => {
    u1Token = await createTestToken("u1");
    u2Token = await createTestToken("admin"); // Using 'admin' as u2 for convenience

    // 1. Create a Show
    const showRes = await db.query(`
      INSERT INTO shows (tmdb_id, title, media_type, popularity)
      VALUES (88888, 'Review Drama', 'tv', 50.0)
      RETURNING id
    `);
    testShowId = showRes.rows[0].id;

    // 2. Create an initial review by u1
    // We need u1's ID first
    const u1Res = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const u1Id = u1Res.rows[0].id;

    const reviewRes = await db.query(`
      INSERT INTO reviews (user_id, show_id, rating, content, contains_spoilers)
      VALUES ($1, $2, 8, 'Great show!', false)
      RETURNING id
    `, [u1Id, testShowId]);
    testReviewId = reviewRes.rows[0].id;
  });

  /** POST /api/v1/reviews */
  describe("POST /api/v1/reviews", function () {
    test("works for logged in user (u2)", async function () {
      const resp = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${u2Token}`)
        .send({
          showId: testShowId,
          rating: 10,
          content: "Masterpiece!",
          containsSpoilers: true
        });
      
      expect(resp.statusCode).toEqual(201);
      expect(resp.body.data.rating).toEqual(10);
      expect(resp.body.data.content).toEqual("Masterpiece!");
    });

    test("fails if user reviews same show twice", async function () {
      // u1 already reviewed this in beforeAll
      const resp = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({
          showId: testShowId,
          rating: 1,
          content: "Spam review"
        });
      
      expect(resp.statusCode).toEqual(400); // Duplicate violation
      expect(resp.body.message).toMatch(/already reviewed/);
    });

    test("404 if show not found", async function () {
      const resp = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({
          showId: 0,
          rating: 5,
          content: "Ghost show"
        });
      expect(resp.statusCode).toEqual(404);
    });
  });

  /** GET /api/v1/reviews/:id */
  describe("GET /api/v1/reviews/:id", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/api/v1/reviews/${testReviewId}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body.data.content).toEqual("Great show!");
    });

    test("404 if not found", async function () {
      const resp = await request(app).get(`/api/v1/reviews/0`);
      expect(resp.statusCode).toEqual(404);
    });
  });

  /** PUT /api/v1/reviews/:id */
  describe("PUT /api/v1/reviews/:id", function () {
    test("works for owner (u1)", async function () {
      const resp = await request(app)
        .put(`/api/v1/reviews/${testReviewId}`)
        .set("Authorization", `Bearer ${u1Token}`)
        .send({
          rating: 9,
          content: "Updated content"
        });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.data.rating).toEqual(9);
      expect(resp.body.data.content).toEqual("Updated content");
    });

    test("unauth for non-owner (u2)", async function () {
      const resp = await request(app)
        .put(`/api/v1/reviews/${testReviewId}`)
        .set("Authorization", `Bearer ${u2Token}`)
        .send({
          rating: 1,
          content: "Hacked!"
        });

      expect(resp.statusCode).toEqual(401);
    });
  });

  /** DELETE /api/v1/reviews/:id */
  describe("DELETE /api/v1/reviews/:id", function () {
    test("unauth for non-owner (u2)", async function () {
      const resp = await request(app)
        .delete(`/api/v1/reviews/${testReviewId}`)
        .set("Authorization", `Bearer ${u2Token}`);
        
      expect(resp.statusCode).toEqual(404); // Or 401, depending on logic. 
      // Our logic returns 404 "Review not found or unauthorized" for security.
    });

    test("works for owner (u1)", async function () {
      const resp = await request(app)
        .delete(`/api/v1/reviews/${testReviewId}`)
        .set("Authorization", `Bearer ${u1Token}`);
        
      expect(resp.statusCode).toEqual(200);

      // Verify deleted
      const check = await request(app).get(`/api/v1/reviews/${testReviewId}`);
      expect(check.statusCode).toEqual(404);
    });
  });

  /** GET /api/v1/shows/:id/reviews */
  describe("GET /api/v1/shows/:id/reviews", function () {
    test("works", async function () {
      const resp = await request(app).get(`/api/v1/shows/${testShowId}/reviews`);
      expect(resp.statusCode).toEqual(200);
      // Depending on previous tests, we might have 0 or 1 reviews left
      // (u1's review was deleted above).
      // But the endpoint should work regardless.
      expect(Array.isArray(resp.body.data)).toBe(true);
    });
  });
});