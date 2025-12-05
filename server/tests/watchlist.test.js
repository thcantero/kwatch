"use strict";

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

describe("Watchlist Routes", function () {
  let u1Token;
  let testShowId;

  // We need a show in the DB to test the watchlist!
  beforeAll(async () => {
    u1Token = await createTestToken("u1");

    // Insert a dummy show directly for testing
    const result = await db.query(`
      INSERT INTO shows (tmdb_id, title, media_type, popularity)
      VALUES (99999, 'Test Drama', 'tv', 100.0)
      RETURNING id
    `);
    testShowId = result.rows[0].id;
  });

  /** POST /api/v1/watchlist */
  describe("POST /api/v1/watchlist", function () {
    test("works for logged in user", async function () {
      const resp = await request(app)
        .post("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({
          showId: testShowId,
          status: "watching"
        });
        
      expect(resp.statusCode).toEqual(201);
      expect(resp.body.data).toEqual({
        user_id: expect.any(Number),
        show_id: testShowId,
        status: "watching"
      });
    });

    test("unauth for anon", async function () {
      const resp = await request(app)
        .post("/api/v1/watchlist")
        .send({ showId: testShowId });
      expect(resp.statusCode).toEqual(401);
    });

    test("404 if show id does not exist", async function () {
      const resp = await request(app)
        .post("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({ showId: 0 }); // ID 0 never exists
      expect(resp.statusCode).toEqual(404);
    });
  });

  /** GET /api/v1/watchlist */
  describe("GET /api/v1/watchlist", function () {
    test("works for logged in user", async function () {
      // 1. Add item first
      await request(app)
        .post("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({ showId: testShowId, status: "watching" });

      // 2. Get list
      const resp = await request(app)
        .get("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.data.length).toEqual(1);
      expect(resp.body.data[0].title).toEqual("Test Drama"); // Checked JOIN
      expect(resp.body.data[0].status).toEqual("watching");
    });
  });

  /** PUT /api/v1/watchlist/:id */
  describe("PUT /api/v1/watchlist/:id", function () {
    test("works: update status", async function () {
      // 1. Setup
      await request(app)
        .post("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({ showId: testShowId, status: "watching" });

      // 2. Update
      const resp = await request(app)
        .put(`/api/v1/watchlist/${testShowId}`)
        .set("Authorization", `Bearer ${u1Token}`)
        .send({ status: "completed", rating: 5 });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body.data.status).toEqual("completed");
      expect(resp.body.data.rating).toEqual(5);
    });
  });

  /** DELETE /api/v1/watchlist/:id */
  describe("DELETE /api/v1/watchlist/:id", function () {
    test("works", async function () {
      // 1. Setup
      await request(app)
        .post("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`)
        .send({ showId: testShowId });

      // 2. Delete
      const resp = await request(app)
        .delete(`/api/v1/watchlist/${testShowId}`)
        .set("Authorization", `Bearer ${u1Token}`);

      expect(resp.statusCode).toEqual(200);

      // 3. Verify it's gone
      const check = await request(app)
        .get("/api/v1/watchlist")
        .set("Authorization", `Bearer ${u1Token}`);
      expect(check.body.data.length).toEqual(0);
    });
  });
});