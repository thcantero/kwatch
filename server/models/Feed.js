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
            -- 1. REVIEWS
            SELECT
                'review' AS type,
                r.id,                  -- Frontend expects 'id'
                r.created_at,          -- Frontend expects 'created_at'
                u.username,            -- Frontend expects 'username'
                u.id AS user_id,       -- Frontend expects 'user_id' (for profile link)
                s.title AS show_title, -- Frontend expects 'show_title'
                s.id AS show_id,       -- Frontend expects 'show_id' (for show link)
                s.poster_url,          -- Frontend expects 'poster_url'
                r.content,             
                r.rating
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN shows s ON r.show_id = s.id
            WHERE r.user_id IN (
                SELECT followed_id FROM follows WHERE follower_id = $1
            )
            
            UNION ALL
            
            -- 2. WATCHLIST UPDATES
            SELECT
                'watchlist' AS type,
                -- Watchlist items might not have a unique ID, so we create a fake unique one 
                -- by combining user_id and show_id for the React Key
                (w.user_id * 100000 + w.show_id) AS id,
                w.updated_at AS created_at,
                u.username,
                u.id AS user_id,
                s.title AS show_title,
                s.id AS show_id,
                s.poster_url,
                ('Updated status to ' || w.status) AS content, -- Mock content so it renders text
                NULL AS rating
            FROM watchlist w
            JOIN users u ON w.user_id = u.id
            JOIN shows s ON w.show_id = s.id
            WHERE w.user_id IN (
                SELECT followed_id FROM follows WHERE follower_id = $1
            )
            AND w.status IN ('completed', 'dropped')
            
            ORDER BY created_at DESC
            LIMIT $2
            `,
            [currentUserId, limit]
        );
        return result.rows;
    }

    /** * Retrieves global activity for discoverability (no login required).
     * Returns recent reviews from all users.
     */
    static async getGlobalFeed() {
        const result = await db.query(
            `
            SELECT
                r.id, 
                r.rating, 
                r.content, 
                r.created_at,
                u.username, 
                u.id AS user_id,
                s.title AS show_title, 
                s.id AS show_id,
                s.poster_url
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN shows s ON r.show_id = s.id
            ORDER BY r.created_at DESC
            LIMIT 50`,
        );
        return result.rows;
    }
}

module.exports = Feed;