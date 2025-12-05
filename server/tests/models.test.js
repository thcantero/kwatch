const { db } = require("../config/db");
const Show = require("../models/Show");
const User = require("../models/User");

// 1. Tell Jest to use your manual mock from services/__mocks__/tmdb.js
jest.mock("../services/tmdb");

// 2. Import it so we can override methods in specific tests (e.g., forcing errors)
const TMDBService = require("../services/tmdb");

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
    // Ensure DB is empty so it hits the API
    await db.query("DELETE FROM shows");

    // The mock returns 3 movies + 2 TV shows = 5 total
    const shows = await Show.getPopular(5);
    
    expect(shows.length).toEqual(5);
    expect(shows[0].title).toEqual("Mock Movie 1"); // Matches mock data
    
    const dbRes = await db.query("SELECT * FROM shows");
    expect(dbRes.rows.length).toBeGreaterThan(0);
  });

  test("search finds shows", async function () {
    // The mock default for searchMulti returns "The Glory"
    const results = await Show.search("Glory");
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toEqual("The Glory"); // Matches mock data
  });

  test('getDetails - handles non-existent show', async () => {
    // FIX: Explicitly delete this ID to ensure it definitely does not exist
    // This prevents "Received function did not throw" errors
    await db.query("DELETE FROM shows WHERE id = 999999");
    
    await expect(Show.getDetails(999999))
      .rejects
      .toThrow('Show not found');
  });

  test('search - returns shows by title', async () => {
    // 1. Insert a show with the SAME tmdb_id as the mock (999)
    // The mock returns { id: 999, title: "The Glory" ... }
    const showRes = await db.query(
      `INSERT INTO shows (title, tmdb_id, synopsis, media_type, release_year, poster_url, popularity, vote_average) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id`,
      ['The Glory', 999, 'Test overview', 'movie', 2022, '/glory.jpg', 100, 8.5]
    );
    
    const showId = showRes.rows[0].id;
    
    // 2. Search. The mock returns tmdb_id 999.
    // Show.search -> Show.create -> ON CONFLICT UPDATE -> Returns existing ID
    const shows = await Show.search('The Glory');
    
    expect(shows).toHaveLength(1);
    expect(shows[0].id).toBe(showId); // Should now match
    expect(shows[0].title).toContain('The Glory');
  });

  test('search - returns empty array for no matches', async () => {
    // OVERRIDE: Force search to return empty for this specific test
    TMDBService.searchMulti.mockResolvedValueOnce({ results: [] });

    const shows = await Show.search('Nonexistent Show Title');
    expect(shows).toEqual([]);
  });

  test('getPopular - handles cache miss with error', async () => {
    await db.query("DELETE FROM shows");
    
    // OVERRIDE: Force error for this specific test
    TMDBService.getPopularMovies.mockRejectedValueOnce(new Error('API Error'));
    
    await expect(Show.getPopular())
      .rejects
      .toThrow('API Error');
  });
    
  test('getByGenre - returns shows by genre', async () => {
    const shows = await Show.getByGenre('Action');
    expect(Array.isArray(shows)).toBe(true);
  });
});

describe('User Model', () => {
  test('getByUsername - handles non-existent user', async () => {
    const user = await User.getByUsername('nonexistentuser');
    expect(user).toBeUndefined();
  });

  test('update - updates user profile', async () => {
    const updatedData = {
      email: 'updated@test.com',
      bio: 'Updated bio for testing'
    };
    
    // Assumes user ID 1 exists from seed (commonBeforeEach)
    const user = await User.update(1, updatedData);
    expect(user.email).toBe(updatedData.email);
    expect(user.bio).toBe(updatedData.bio);
  });

  test('update - handles invalid user ID', async () => {
    // FIX: Use a definite non-existent ID and ensure it's gone
    const invalidId = 0; 
    await db.query("DELETE FROM users WHERE id = $1", [invalidId]);

    await expect(User.update(invalidId, { email: 'test@test.com' }))
      .rejects
      .toThrow('User not found');
  });

  test('search - finds users by username', async () => {
    const users = await User.search('u1');
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].username).toBe('u1');
  });

  test('search - returns empty array for no matches', async () => {
    const users = await User.search('nonexistent');
    expect(users).toEqual([]);
  });

  test('getUserStats - returns user statistics', async () => {
    const stats = await User.getUserStats(1);
    expect(stats).toHaveProperty('review_count');
    expect(stats).toHaveProperty('watchlist_count');
  });
});

describe('Database Connection', () => {
  test('handles connection errors gracefully', async () => {
    const originalQuery = db.query;
    db.query = jest.fn(() => Promise.reject(new Error('Connection failed')));
    
    await expect(User.getByUsername('u1'))
      .rejects
      .toThrow('Connection failed');
    
    db.query = originalQuery; 
  });

  test('handles SQL syntax errors', async () => {
    await expect(db.query('SELECT * FROM nonexistent_table'))
      .rejects
      .toThrow();
  });
});