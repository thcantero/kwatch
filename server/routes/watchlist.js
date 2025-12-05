const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { ensureLoggedIn } = require("../middleware/auth");
const { 
    addToWatchlist, 
    getMyWatchlist, 
    updateWatchlistItem, 
    removeFromWatchlist 
} = require("../controllers/watchlistController");

// 🔒 All watchlist routes require login
router.use(ensureLoggedIn);

router.get("/", asyncHandler(getMyWatchlist));
router.post("/", asyncHandler(addToWatchlist));
router.put("/:showId", asyncHandler(updateWatchlistItem));
router.delete("/:showId", asyncHandler(removeFromWatchlist));

module.exports = router;

//POST  /api/watchlist  - Add a show to my list. Body: { showId, status: 'watching' }.

//PUT   /api/watchlist/:showIdUpdate status (e.g., 'watching' $\rightarrow$ 'completed', Update Progress).

//DELETE    /api/watchlist/:showId  - Remove a show from my list.