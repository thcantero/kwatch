const { db } = require("../config/db");
const Show = require("../models/Show");
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

describe("Show Model", function () {
  test("getPopular fetches from API if DB empty", async function () {
    // 1. Ensure DB is empty
    await db.query("DELETE FROM shows");

    // 2. Call Model (This should trigger TMDB fetch)
    const shows = await Show.getPopular(5);

    expect(shows.length).toEqual(5);
    expect(shows[0]).toHaveProperty("title");
    expect(shows[0]).toHaveProperty("tmdb_id");

    // 3. Verify it actually saved to DB
    const dbRes = await db.query("SELECT * FROM shows");
    expect(dbRes.rows.length).toBeGreaterThan(0);
  });

  test("search finds shows", async function () {
    // Note: This relies on TMDB API being up. 
    // To do: test if TMDB API is up
    const results = await Show.search("Glory");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toMatch(/Glory/i);
  });
});