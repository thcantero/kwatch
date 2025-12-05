const Show = require('../models/Show');
const { SuccessResponse, NotFoundResponse } = require('../utils/responses');

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
    const { id } = req.params;
    
    // 1. Get Show from DB
    const show = await Show.getById(id);
    if (!show) throw new NotFoundResponse('Show not found');

    // 2. Parallel Fetch: Cast + Trailer (Optimization!)
    const [cast, trailerKey] = await Promise.all([
        Show.getCast(show),
        Show.getTrailer(show)
    ]);

    // 3. Attach cast to the response
    const data = { 
        ...show, 
        cast, 
        trailer_url: trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : null 
    };

    return new SuccessResponse('Show details retrieved', data).send(res);
};

module.exports = { getPopularShows, searchShows, getShowDetails };
