const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const { 
    BadRequestResponse, 
    UnauthorizedResponse, 
    NotFoundResponse 
} = require("../utils/responses");

const BCRYPT_WORK_FACTOR = 12;

class User {

  /** Register user with data.
   * Returns { id, username, firstName, lastName, email, isAdmin }
   */
  static async register({ username, password, firstName, lastName, email, isAdmin = false }) {
    // 1. Check duplicates
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestResponse(`Duplicate username: ${username}`);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // 3. Insert
    const result = await db.query(
      `INSERT INTO users 
       (username, password_hash, name, email) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, name, email`,
      [username, hashedPassword, `${firstName} ${lastName}`, email]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT id, username, password_hash, name, email
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (isValid === true) {
        delete user.password_hash; // Remove sensitive data
        return user;
      }
    }

    throw new UnauthorizedResponse("Invalid username/password");
  }

  /** Get user public profile */
  static async get(id) {
    const result = await db.query(
      `SELECT id, username, name, email, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    const user = result.rows[0];
    if (!user) throw new NotFoundResponse(`No user found with ID: ${id}`);

    return user;
  }
  
  /** Update user profile (Partial update) */
  static async update(userId, data) {
    const { email, bio } = data;
    
    const result = await db.query(
        `UPDATE users 
         SET email = COALESCE($1, email), 
             bio = COALESCE($2, bio)
         WHERE id = $3 
         RETURNING id, username, email, bio, created_at`,
        [email, bio, userId]
    );
    
    const user = result.rows[0];
    if (!user) {
        throw new NotFoundResponse('User not found');
    }
    
    return user;
}

  static async search(username) {
    const result = await db.query(
        `SELECT id, username, name FROM users WHERE username ILIKE $1`,
        [`%${username}%`]
    );
    return result.rows;
}

static async getUserStats(userId) {
    // Simple stats query
    const result = await db.query(
        `SELECT 
            (SELECT COUNT(*) FROM reviews WHERE user_id = $1) AS review_count,
            (SELECT COUNT(*) FROM watchlist WHERE user_id = $1) AS watchlist_count,
            (SELECT COUNT(*) FROM follows WHERE followed_id = $1) AS follower_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following_count`,
        [userId]
    );
    return result.rows[0];
}

/** Find user by username */
  static async getByUsername(username) {
    const result = await db.query(
      `SELECT id, username, name, email, is_admin AS "isAdmin"
       FROM users
       WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

}

module.exports = User;