const { db } = require("../config/db");
const { NotFoundResponse, BadRequestResponse } = require("../utils/responses");

class Follow {

    /** * Starts a follow relationship. */
    static async follow(followerId, followedId) {
        if (followerId === followedId) {
            throw new BadRequestResponse("Cannot follow yourself.");
        }
        // Check if user being followed exists (optional, but good)
        const userCheck = await db.query(`SELECT id FROM users WHERE id = $1`, [followedId]);
        if (!userCheck.rows[0]) throw new NotFoundResponse("User not found.");

        try {
            await db.query(
                `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`,
                [followerId, followedId]
            );
            return { followedId, status: "following" };
        } catch (err) {
            if (err.code === '23505') { // Postgres duplicate key error
                throw new BadRequestResponse("Already following this user.");
            }
            throw err;
        }
    }

    /** * Removes a follow relationship. */
    static async unfollow(followerId, followedId) {
        const result = await db.query(
            `DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2 RETURNING followed_id`,
            [followerId, followedId]
        );

        if (!result.rows[0]) {
            throw new NotFoundResponse("Not currently following this user.");
        }
        return { followedId, status: "unfollowed" };
    }

    /** * Get list of users followed by a specific user. */
    static async getFollowing(userId) {
        const result = await db.query(
            `SELECT f.followed_id AS id, u.username 
             FROM follows f
             JOIN users u ON f.followed_id = u.id
             WHERE f.follower_id = $1`,
            [userId]
        );
        return result.rows;
    }

    /** * Get list of users who follow a specific user. */
    static async getFollowers(userId) {
        const result = await db.query(
            `SELECT f.follower_id AS id, u.username 
             FROM follows f
             JOIN users u ON f.follower_id = u.id
             WHERE f.followed_id = $1`,
            [userId]
        );
        return result.rows;
    }

    /** Follow an actor */
    static async followActor(userId, actorId) {
        // Ensure actor exists in our local DB first
        // (If user clicks follow on a fresh actor page, we need to ensure the ID is valid in our DB)
        // Since we upsert actors on search/load, they should exist, but safety first.
        
        const res = await db.query(
            `INSERT INTO actor_follows (user_id, actor_id)
             VALUES ($1, $2)
             RETURNING user_id, actor_id`,
            [userId, actorId]
        );
        return res.rows[0];
    }

    /** Unfollow an actor */
    static async unfollowActor(userId, actorId) {
        const res = await db.query(
            `DELETE FROM actor_follows 
             WHERE user_id = $1 AND actor_id = $2
             RETURNING user_id, actor_id`,
            [userId, actorId]
        );
        if (!res.rows[0]) throw new NotFoundResponse("Follow not found");
        return res.rows[0];
    }

    /** Check if user follows actor */
    static async isFollowingActor(userId, actorId) {
        const res = await db.query(
            `SELECT 1 FROM actor_follows 
             WHERE user_id = $1 AND actor_id = $2`,
            [userId, actorId]
        );
        return !!res.rows[0];
    }
}

module.exports = Follow;