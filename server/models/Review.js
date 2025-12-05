const { db } = require("../config/db");
const { NotFoundResponse, BadRequestResponse, UnauthorizedResponse } = require("../utils/responses");

class Review {
  
  /** * Create a new review.
   * data: { userId, showId, rating, content, containsSpoilers }
   */
  static async create({ userId, showId, rating, content, containsSpoilers = false }) {
    // 1. Check if show exists
    const showCheck = await db.query(`SELECT id FROM shows WHERE id = $1`, [showId]);
    if (!showCheck.rows[0]) throw new NotFoundResponse(`Show ID ${showId} not found`);

    // 2. Insert Review (Handle duplicate via DB constraint)
    try {
      const result = await db.query(
        `INSERT INTO reviews 
         (user_id, show_id, rating, content, contains_spoilers)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, show_id, rating, content, created_at`,
        [userId, showId, rating, content, containsSpoilers]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') { // Unique violation
        throw new BadRequestResponse("You have already reviewed this show");
      }
      throw err;
    }
  }

  /**
   * Get all reviews for a specific show.
   * JOINs with users to get author name.
   */
  static async getForShow(showId) {
    const result = await db.query(
      `SELECT r.id, r.rating, r.content, r.contains_spoilers, r.created_at,
              u.username, u.id AS user_id
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.show_id = $1
       ORDER BY r.created_at DESC`,
      [showId]
    );
    return result.rows;
  }

  /**
   * Get a single review by ID.
   */
  static async get(id) {
    const result = await db.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [id]
    );
    const review = result.rows[0];
    if (!review) throw new NotFoundResponse(`Review ${id} not found`);
    return review;
  }

  /**
   * Update a review.
   * Ensures only the author can update it.
   */
  static async update(id, userId, { rating, content, containsSpoilers }) {
    // 1. Verify ownership first
    const review = await this.get(id);
    if (review.user_id !== userId) {
      throw new UnauthorizedResponse("You can only edit your own reviews");
    }

    // 2. Dynamic Update
    // (Simple version for now, updating all fields provided)
    const result = await db.query(
      `UPDATE reviews 
       SET rating = $1, content = $2, contains_spoilers = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, rating, content, updated_at`,
      [rating, content, containsSpoilers ?? review.contains_spoilers, id]
    );

    return result.rows[0];
  }

  /**
   * Delete a review.
   */
  static async remove(id, userId) {
    const result = await db.query(
      `DELETE FROM reviews 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (!result.rows[0]) {
      throw new NotFoundResponse("Review not found or unauthorized");
    }
    return { message: "Review deleted" };
  }
}

module.exports = Review;