const { db } = require("../config/db");

class Feed {

    /** * Retrieves recent activity from users the current user is following.
     * Combines data from Reviews, Watchlist updates, and potentially Likes.
     */
    static async getFollowedFeed(currentUserId, limit = 50) {
        // Query Explanation:
        // We select the latest 50 events from followed users.
        // This is a common union query structure for social feeds.
        const result = await db.query(
            `
            SELECT
                'review' AS type,
                r.id AS event_id,
                r.created_at AS timestamp,
                u.username AS author_username,
                s.title AS show_title,
                r.content AS review_content,
                r.rating
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN shows s ON r.show_id = s.id
            WHERE r.user_id IN (
                SELECT followed_id FROM follows WHERE follower_id = $1
            )
            
            UNION ALL
            
            SELECT
                'watchlist' AS type,
                w.show_id AS event_id,
                w.updated_at AS timestamp,
                u.username AS author_username,
                s.title AS show_title,
                w.status AS watchlist_status,
                NULL AS rating
            FROM watchlist w
            JOIN users u ON w.user_id = u.id
            JOIN shows s ON w.show_id = s.id
            WHERE w.user_id IN (
                SELECT followed_id FROM follows WHERE follower_id = $1
            )
            AND w.status IN ('completed', 'dropped') -- Only show final states
            
            ORDER BY timestamp DESC
            LIMIT $2
            `,
            [currentUserId, limit]
        );
        return result.rows;
    }

    /** * Retrieves global activity for discoverability (no login required).
     * Returns recent reviews from all users.
     */
    static async getGlobalFeed(limit = 20) {
        const result = await db.query(
            `
            SELECT
                r.id AS review_id,
                r.content,
                r.rating,
                r.created_at,
                u.username AS author_username,
                s.title AS show_title
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN shows s ON r.show_id = s.id
            ORDER BY r.created_at DESC
            LIMIT $1
            `,
            [limit]
        );
        return result.rows;
    }
}

module.exports = Feed;