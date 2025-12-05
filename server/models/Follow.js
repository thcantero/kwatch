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
}

module.exports = Follow;