const { db } = require("../config/db");
const { NotFoundResponse, BadRequestResponse } = require("../utils/responses");

class Like {

    /** * Toggles a 'like' status for a show.
     * If the like exists, it deletes it (unlike). If it doesn't exist, it adds it (like).
     */
    static async toggleShowLike(userId, showId) {
        // 1. Check if the like already exists
        const check = await db.query(
            `SELECT user_id FROM likes WHERE user_id = $1 AND show_id = $2`,
            [userId, showId]
        );

        if (check.rows[0]) {
            // If exists, delete it (UNLIKE)
            await db.query(
                `DELETE FROM likes WHERE user_id = $1 AND show_id = $2`,
                [userId, showId]
            );
            return { action: "unliked", showId };
        } else {
            // If doesn't exist, check show existence and insert (LIKE)
            const showCheck = await db.query(`SELECT id FROM shows WHERE id = $1`, [showId]);
            if (!showCheck.rows[0]) throw new NotFoundResponse(`Show ID ${showId} not found`);

            await db.query(
                `INSERT INTO likes (user_id, show_id) VALUES ($1, $2)`,
                [userId, showId]
            );
            return { action: "liked", showId };
        }
    }

    /** * Toggles a 'like' status for a review. */
    static async toggleReviewLike(userId, reviewId) {
        const check = await db.query(
            `SELECT user_id FROM review_likes WHERE user_id = $1 AND review_id = $2`,
            [userId, reviewId]
        );

        if (check.rows[0]) {
            await db.query(
                `DELETE FROM review_likes WHERE user_id = $1 AND review_id = $2`,
                [userId, reviewId]
            );
            return { action: "unliked", reviewId };
        } else {
            const reviewCheck = await db.query(`SELECT id FROM reviews WHERE id = $1`, [reviewId]);
            if (!reviewCheck.rows[0]) throw new NotFoundResponse(`Review ID ${reviewId} not found`);

            await db.query(
                `INSERT INTO review_likes (user_id, review_id) VALUES ($1, $2)`,
                [userId, reviewId]
            );
            return { action: "liked", reviewId };
        }
    }

    /** * Get all shows a specific user has liked. */
    static async getUserLikes(userId) {
        const result = await db.query(
            `SELECT l.show_id, s.title, s.poster_url 
             FROM likes l
             JOIN shows s ON l.show_id = s.id
             WHERE l.user_id = $1
             ORDER BY l.created_at DESC`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = Like;