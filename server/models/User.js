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
  static async update(id, data) {
      // NOTE: We will implement the dynamic SQL update helper later
      // For now, let's just allow updating the name
      if (data.name) {
          const result = await db.query(
              `UPDATE users SET name = $1, updated_at = NOW() 
               WHERE id = $2 RETURNING id, username, name`,
               [data.name, id]
          );
          return result.rows[0];
      }
      return this.get(id);
  }
}

module.exports = User;