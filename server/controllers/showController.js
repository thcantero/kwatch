const Show = require('../models/Show');
const { SuccessResponse } = require('../utils/responses');

/**
 * GET /api/v1/shows/popular
 */
const getPopularShows = async (req, res) => {
    // 1. Get query param (optional limit)
    const limit = req.query.limit || 20;

    // 2. Ask Model for data 
    const shows = await Show.getPopular(limit);

    // 3. Send standardized JSON response
    return new SuccessResponse('Popular shows retrieved', shows).send(res);
};

const searchShows = async (req, res) => {
    const { q } = req.query; // ?q=The Glory
    const results = await Show.search(q);
    return new SuccessResponse("Search results", results).send(res);
};

const getShowDetails = async (req, res) => {
    const show = await Show.getById(req.params.id);
    return new SuccessResponse("Show details", show).send(res);
};

module.exports = { getPopularShows, searchShows, getShowDetails };
