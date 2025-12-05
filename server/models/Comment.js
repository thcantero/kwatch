
const { db } = require("../config/db");
const { NotFoundResponse, UnauthorizedResponse, BadRequestResponse } = require("../utils/responses");

class Comment {
    /** Creates a new comment for a review. */
    static async create({ userId, reviewId, content }) {
        // 1. Simple validation and check if review exists
        const reviewCheck = await db.query(`SELECT id FROM reviews WHERE id = $1`, [reviewId]);
        if (!reviewCheck.rows[0]) throw new NotFoundResponse(`Review ID ${reviewId} not found.`);
        if (!content || content.trim().length === 0) throw new BadRequestResponse("Comment content cannot be empty.");

        // 2. Insert comment
        const result = await db.query(
            `INSERT INTO comments (user_id, review_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, review_id, user_id, content, created_at`,
            [userId, reviewId, content]
        );
        return result.rows[0];
    }

    /** Retrieves all comments for a given review ID, joining with users for author data. */
    static async getByReview(reviewId) {
        const result = await db.query(
            `SELECT c.id, c.review_id, c.content, c.created_at,
                    u.username, u.id AS user_id
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.review_id = $1
             ORDER BY c.created_at ASC`,
            [reviewId]
        );
        return result.rows;
    }

    /** Deletes a comment. Requires comment ID and user ID for ownership check. */
    static async remove(commentId, userId) {
        const result = await db.query(
            `DELETE FROM comments
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [commentId, userId]
        );

        if (!result.rows[0]) {
            // Throws 404/Unauthorized if ID doesn't exist OR user doesn't own it
            throw new NotFoundResponse("Comment not found or unauthorized to delete.");
        }
        return { message: "Comment deleted" };
    }
}

module.exports = Comment;