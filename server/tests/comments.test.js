const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, createTestToken } = require("./common");
const { NotFoundResponse } = require("../utils/responses"); // Need to import this for one test

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// Global data setup for this test file
let u1Token;
let u2Token;
let testReviewId;

// We need an existing Review for all comment actions
beforeEach(async () => {
    // 1. Get auth tokens
    u1Token = await createTestToken("u1");
    u2Token = await createTestToken("admin"); 

    // 2. Get User IDs
    const u1Res = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const u1Id = u1Res.rows[0].id;
    
    // 3. Create a Test Show (if it doesn't exist, though commonBeforeAll does it)
    const showRes = await db.query(`
        INSERT INTO shows (tmdb_id, title, media_type, popularity)
        VALUES (88888, 'Comment Test Show', 'tv', 50.0)
        RETURNING id
    `);
    const testShowId = showRes.rows[0].id;

    // 4. Create a Review by u1 to comment on
    const reviewRes = await db.query(`
        INSERT INTO reviews (user_id, show_id, rating, content)
        VALUES ($1, $2, 8, 'Review for comments.')
        RETURNING id
    `, [u1Id, testShowId]);
    testReviewId = reviewRes.rows[0].id;

    // Create at least one comment for GET test
    await db.query(
        `INSERT INTO comments (user_id, review_id, content) 
         VALUES ($1, $2, 'Initial test comment')
         ON CONFLICT DO NOTHING`,
        [u1Res.rows[0].id, testReviewId]
    );

    // We leave testReviewId available globally for subsequent tests
});


describe("Comment Routes: POST /reviews/:id/comments & GET /reviews/:id/comments", function () {
    test("POST works for logged in user (u2 posts)", async function () {
        const resp = await request(app)
            .post(`/api/v1/reviews/${testReviewId}/comments`)
            .set("Authorization", `Bearer ${u2Token}`)
            .send({ content: "I agree with this review!" });
        
        expect(resp.statusCode).toEqual(201);
        expect(resp.body.data.content).toEqual("I agree with this review!");
        expect(resp.body.data).toHaveProperty("review_id", testReviewId);
    });

    test("GET works to retrieve list of comments", async function () {
        // u1 and u2 have already posted comments via the setup/post test
        const resp = await request(app)
            .get(`/api/v1/reviews/${testReviewId}/comments`);
            
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.data.length).toBeGreaterThanOrEqual(1); // Should have at least one comment (from POST test)
        expect(resp.body.data[0]).toHaveProperty("username", "u1"); // U2 posted in setup
    });

    test("POST fails if review does not exist", async function () {
        const resp = await request(app)
            .post(`/api/v1/reviews/0/comments`)
            .set("Authorization", `Bearer ${u1Token}`)
            .send({ content: "Ghost comment" });
        
        expect(resp.statusCode).toEqual(404);
    });
});


describe("Comment Routes: DELETE /comments/:id", function () {
    let commentId;
    let u1Id;

    beforeEach(async () => {
        // Get u1's ID
        const u1Res = await db.query("SELECT id FROM users WHERE username = 'u1'");
        u1Id = u1Res.rows[0].id;
        
        // U1 creates a comment we can delete later
        const resp = await db.query(
            `INSERT INTO comments (user_id, review_id, content) 
             VALUES ($1, $2, 'To be deleted.') 
             RETURNING id`,
            [u1Id, testReviewId]
        );
        commentId = resp.rows[0].id;
    });

    test("works for comment owner (u1)", async function () {
        const resp = await request(app)
            .delete(`/api/v1/comments/${commentId}`)
            .set("Authorization", `Bearer ${u1Token}`);
        
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.data).toBeFalsy();

        // Verify it is gone
        const check = await db.query("SELECT id FROM comments WHERE id = $1", [commentId]);
        expect(check.rows.length).toEqual(0);
    });

    test("fails for non-owner (u2)", async function () {
        // Create a comment for u2 to try to delete
        const otherCommentRes = await db.query(
            `INSERT INTO comments (user_id, review_id, content) 
             VALUES ($1, $2, 'Another comment') 
             RETURNING id`,
            [u1Id, testReviewId] // Still u1's comment
        );
        const otherCommentId = otherCommentRes.rows[0].id;

        const resp = await request(app)
            .delete(`/api/v1/comments/${otherCommentId}`)
            .set("Authorization", `Bearer ${u2Token}`);
        
        expect(resp.statusCode).toEqual(404); // Should be 404 or 403
    });

    test("fails for anonymous user", async function () {
        const resp = await request(app)
            .delete(`/api/v1/comments/${commentId + 1}`); // Use a high ID that likely exists in the database
        
        expect(resp.statusCode).toEqual(401);
    });
});