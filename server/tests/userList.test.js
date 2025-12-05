const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");
const Follow = require("../models/Follow");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, createTestToken } = require("./common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("User Profile List Routes", function () {
    let u1Token;
    let u1Id;
    let u2Id;
    let testShowId;

    beforeAll(async () => {
        // Setup data for U1, U2, and a Show
        u1Token = await createTestToken("u1");

        const u1Res = await db.query("SELECT id FROM users WHERE username = 'u1'");
        const u2Res = await db.query("SELECT id FROM users WHERE username = 'admin'");
        u1Id = u1Res.rows[0].id;
        u2Id = u2Res.rows[0].id;

        const showRes = await db.query(`
            INSERT INTO shows (tmdb_id, title, media_type, popularity)
            VALUES (77777, 'Follow Test Show', 'movie', 10.0)
            RETURNING id
        `);
        testShowId = showRes.rows[0].id;

        // Populate relationships for testing lists
        // 1. U1 Follows U2
        await db.query(`INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`, [u1Id, u2Id]);
        // 2. U1 Likes the Test Show
        await db.query(`INSERT INTO likes (user_id, show_id) VALUES ($1, $2)`, [u1Id, testShowId]);
        // 3. U1 Adds to Watchlist (Completed status to ensure it shows up in list query)
        await db.query(`INSERT INTO watchlist (user_id, show_id, status) VALUES ($1, $2, 'completed')`, [u1Id, testShowId]);
    });

    // --- FOLLOWS ---
    describe("GET /users/:id/following", function () {
        test("works: u1's following list (expect 1 user)", async function () {
            const resp = await request(app).get(`/api/v1/users/${u1Id}/following`);
            expect(resp.statusCode).toEqual(200);
            expect(resp.body.data.length).toEqual(1);
            expect(resp.body.data[0].username).toEqual("admin");
        });

        test("works: u2's following list (expect 0 users)", async function () {
            const resp = await request(app).get(`/api/v1/users/${u2Id}/following`);
            expect(resp.statusCode).toEqual(200);
            expect(resp.body.data.length).toEqual(0);
        });
    });

    // --- LIKES ---
    describe("GET /users/:id/likes", function () {
        test("works: u1's likes (expect 1 show)", async function () {
            const resp = await request(app).get(`/api/v1/users/${u1Id}/likes`);
            expect(resp.statusCode).toEqual(200);
            expect(resp.body.data.length).toEqual(1);
            expect(resp.body.data[0].show_id).toEqual(testShowId);
        });
    });

    // --- WATCHLIST ---
    describe("GET /users/:id/watchlist", function () {
        test("works: u1's watchlist (expect 1 show)", async function () {
            const resp = await request(app).get(`/api/v1/users/${u1Id}/watchlist`);
            expect(resp.statusCode).toEqual(200);
            expect(resp.body.data.length).toEqual(1);
            expect(resp.body.data[0].status).toEqual("completed");
        });
    });

    // --- FOLLOW/UNFOLLOW ACTIONS ---
    describe("POST/DELETE /users/:id/follow", function () {
        test("POST /follow works (u2 follows u1)", async function () {
            const adminToken = await createTestToken("admin"); 
            const followResp = await request(app)
                .post(`/api/v1/users/${u1Id}/follow`)
                .set("Authorization", `Bearer ${adminToken}`); 
            
            expect(followResp.statusCode).toEqual(200);
            expect(followResp.body.data.status).toEqual("following");
            
                     
            // Verify u1 now has one follower (u2/admin)
            const followersRes = await Follow.getFollowers(u1Id);
            expect(followersRes.length).toEqual(1); 
        });
    });
});