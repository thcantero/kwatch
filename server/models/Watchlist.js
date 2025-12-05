const { db } = require("../config/db");
const { BadRequestResponse, NotFoundResponse } = require("../utils/responses");

class Watchlist {

  /** * Add a show to the user's watchlist.
   * Data: { showId, status, currentEpisode, rating }
   */
  static async add(userId, { showId, status = 'to_watch', currentEpisode = 0, rating = null }) {
    // 1. Check if show exists (Referential integrity usually handles this, but good for explicit errors)
    const showCheck = await db.query(`SELECT id FROM shows WHERE id = $1`, [showId]);
    if (!showCheck.rows[0]) throw new NotFoundResponse(`Show ID ${showId} not found`);

    // 2. Insert (or Update if exists - Upsert)
    // We use ON CONFLICT to handle cases where they re-add a show
    const result = await db.query(
      `INSERT INTO watchlist 
       (user_id, show_id, status, current_episode, rating)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, show_id) 
       DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING user_id, show_id, status`,
      [userId, showId, status, currentEpisode, rating]
    );

    return result.rows[0];
  }

  /**
   * Update a watchlist entry.
   * Supports partial updates (e.g., just updating episode count).
   */
  static async update(userId, showId, data) {
    // Dynamic Query Builder for partial updates
    const { setCols, values } = this._sqlForPartialUpdate(
        data, 
        { currentEpisode: "current_episode" } // Mappings (jsName: db_name)
    );
    
    // If no data provided
    if (setCols.length === 0) throw new BadRequestResponse("No data to update");

    const querySql = `
      UPDATE watchlist 
      SET ${setCols}, updated_at = NOW()
      WHERE user_id = $${values.length + 1} AND show_id = $${values.length + 2}
      RETURNING show_id, status, current_episode, rating, notes
    `;

    const result = await db.query(querySql, [...values, userId, showId]);
    const item = result.rows[0];

    if (!item) throw new NotFoundResponse(`Show not found in watchlist`);
    return item;
  }

  /**
   * Remove a show from watchlist.
   */
  static async remove(userId, showId) {
    const result = await db.query(
      `DELETE FROM watchlist 
       WHERE user_id = $1 AND show_id = $2
       RETURNING show_id`,
      [userId, showId]
    );
    
    if (!result.rows[0]) throw new NotFoundResponse(`Show not found in watchlist`);
    return { message: "Deleted" };
  }

  /**
   * Get all items in a user's watchlist.
   * JOINs with 'shows' table to return useful UI data.
   */
  static async list(userId) {
    const result = await db.query(
      `SELECT w.show_id, w.status, w.current_episode, w.rating, w.favorite,
              s.title, s.poster_url, s.total_episodes, s.media_type
       FROM watchlist w
       JOIN shows s ON w.show_id = s.id
       WHERE w.user_id = $1
       ORDER BY w.updated_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Helper for dynamic SQL updates (Partial Update)
   */
  static _sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) return { setCols: "", values: [] };

    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`
    );

    return {
      setCols: cols.join(", "),
      values: Object.values(dataToUpdate),
    };
  }
}

module.exports = Watchlist;