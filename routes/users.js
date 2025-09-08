

// GET /users/:id - Get user public profile

// PUT /users/:id - Update user profile (authenticated)

// GET /users/:id/watchlist - Get user's watchlist (if public, else require auth)

// GET /users/:id/reviews -  Get user's reviews

// GET /users/:id/watchlist  → Get user's watchlist (from DB)
// POST /users/:id/watchlist → Add to watchlist (save to DB)
// GET /users/:id/following  → Get followed users (from DB)
// POST /users/:id/follow    → Follow user (save to DB)