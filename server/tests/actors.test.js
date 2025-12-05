const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /api/v1/actors/popular", function () {
  test("works", async function () {
    // Clear DB to remove stale seed data
    await db.query("DELETE FROM actors");

    const resp = await request(app).get("/api/v1/actors/popular");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.data.length).toBeGreaterThan(0);
    expect(resp.body.data[0]).toHaveProperty("name");
    
    // With DB cleared, this should now fetch from Mock API (returning Lee Jung-jae)
    expect(resp.body.data[0].name).toEqual("Mock Actor 1");
  });
});