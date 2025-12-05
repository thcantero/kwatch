const jwt = require("jsonwebtoken");
const { UnauthorizedResponse } = require("../utils/responses")

/** Middleware: Authenticate user.
 *
 * If a token is provided, verify it, and, if valid, store the token payload
 * on res.locals.user.
 *
 * It's not an error if no token is provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {
  try {
    const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is logged in. */
function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) {
    throw new UnauthorizedResponse("You must be logged in to access this resource");
  }
  return next();
}

/** Middleware: Requires correct username (or admin). */
function ensureCorrectUserOrAdmin(req, res, next) {
  const user = res.locals.user;
  const requestedId = parseInt(req.params.id);

  if (!(user && (user.isAdmin || user.id === requestedId))) {
    throw new UnauthorizedResponse("Unauthorized access");
  }
  return next();
}

/** Middleware: Check if user is logged in, but don't throw error if not.
 * Useful for pages that change slightly based on auth (like Show Details).
 */
function ensureOptionalLogin(req, res, next) {
  // authenticateJWT already ran globally in app.js, so res.locals.user is set if token was valid.
  // We just pass through.
  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  ensureOptionalLogin,
};