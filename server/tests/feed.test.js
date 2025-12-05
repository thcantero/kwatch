const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, createTestToken } = require("./common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Feed Routes", function () {
    let u1Token;
    let u1Id;
    let u2Id;
    let testShowId;
    let testReviewId;

    beforeAll(async () => {
        u1Token = await createTestToken("u1");

        const u1Res = await db.query("SELECT id FROM users WHERE username = 'u1'");
        const u2Res = await db.query("SELECT id FROM users WHERE username = 'admin'");
        u1Id = u1Res.rows[0].id;
        u2Id = u2Res.rows[0].id;

        const showRes = await db.query(`
            INSERT INTO shows (tmdb_id, title, media_type, popularity)
            VALUES (11111, 'Feed Test Show', 'tv', 10.0)
            RETURNING id
        `);
        testShowId = showRes.rows[0].id;

        // 1. U1 Follows U2 (for followed feed test)
        await db.query(`INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`, [u1Id, u2Id]);
        
        // 2. U2 (followed user) posts a Review
        const reviewRes = await db.query(`
            INSERT INTO reviews (user_id, show_id, rating, content)
            VALUES ($1, $2, 9, 'U2s review on test show.')
            RETURNING id
        `, [u2Id, testShowId]);
        testReviewId = reviewRes.rows[0].id;
        
        // 3. U2 updates watchlist status to 'completed'
        await db.query(`INSERT INTO watchlist (user_id, show_id, status) VALUES ($1, $2, 'completed')`, [u2Id, testShowId]);
    });

    /** GET /api/v1/feed/global (Public) */
    describe("GET /api/v1/feed/global", function () {
        test("works and returns reviews globally", async function () {
            const resp = await request(app).get("/api/v1/feed/global");
            expect(resp.statusCode).toEqual(200);
            expect(resp.body.data.length).toBeGreaterThan(0);
            expect(resp.body.data[0]).toHaveProperty("show_title", "Feed Test Show");
        });
    });

    /** GET /api/v1/feed (Protected) */
    describe("GET /api/v1/feed", function () {
        test("works for logged in user (u1) and contains followed activity", async function () {
            const resp = await request(app)
                .get("/api/v1/feed")
                .set("Authorization", `Bearer ${u1Token}`);
            
            expect(resp.statusCode).toEqual(200);
            expect(resp.body.data.length).toBeGreaterThanOrEqual(2); // Should have Review + Watchlist
            expect(resp.body.data.some(e => e.type === 'review')).toBe(true);
            expect(resp.body.data.some(e => e.type === 'watchlist')).toBe(true);
            expect(resp.body.data[0].author_username).toEqual("admin"); // U2 is admin/followed
        });

        test("unauth for anon", async function () {
            const resp = await request(app).get("/api/v1/feed");
            expect(resp.statusCode).toEqual(401);
        });
    });
});