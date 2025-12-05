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

describe("GET /shows/popular", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/api/v1/shows/popular");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.success).toEqual(true);
    expect(Array.isArray(resp.body.data)).toEqual(true);
  });

  test("respects limit query param", async function () {
    const resp = await request(app).get("/api/v1/shows/popular?limit=2");
    expect(resp.body.data.length).toEqual(2);
  });
});

describe("GET /genres", function () {
    test("works", async function () {
        const resp = await request(app).get("/api/v1/genres");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.data.length).toBeGreaterThan(0);
    });
});