const Watchlist = require("../models/Watchlist");
const { SuccessResponse, CreatedResponse } = require("../utils/responses");

// POST /api/watchlist
const addToWatchlist = async (req, res) => {
    const userId = res.locals.user.id;
    // req.body should have { showId, status }
    const item = await Watchlist.add(userId, req.body);
    return new CreatedResponse("Added to watchlist", item).send(res);
};

// GET /api/users/:id/watchlist OR /api/watchlist
const getMyWatchlist = async (req, res) => {
    const userId = res.locals.user.id;
    const list = await Watchlist.list(userId);
    return new SuccessResponse("Watchlist retrieved", list).send(res);
};

// PUT /api/watchlist/:showId
const updateWatchlistItem = async (req, res) => {
    const userId = res.locals.user.id;
    const { showId } = req.params;
    const item = await Watchlist.update(userId, showId, req.body);
    return new SuccessResponse("Watchlist updated", item).send(res);
};

// DELETE /api/watchlist/:showId
const removeFromWatchlist = async (req, res) => {
    const userId = res.locals.user.id;
    const { showId } = req.params;
    await Watchlist.remove(userId, showId);
    return new SuccessResponse("Removed from watchlist").send(res);
};

module.exports = {
    addToWatchlist,
    getMyWatchlist,
    updateWatchlistItem,
    removeFromWatchlist
};