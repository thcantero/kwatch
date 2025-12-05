const Show = require('../models/Show');
const { SuccessResponse, NotFoundResponse } = require('../utils/responses');
const TMDBService = require('../services/tmdb');

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
    let show = null;

    // 1. Try Finding by Local ID (Primary Key)
    try {
        // We assume 'id' might be a local ID first
        show = await Show.getById(id);
    } catch (e) {
        // Ignore error, proceed to fallback
    }

    // 2. Try Finding by TMDB ID (Secondary Lookup)
    // If the link came from Actor Details, 'id' is likely a TMDB ID
    if (!show) {
        show = await Show.findByTmdbId(id);
    }

    // 3. Last Resort: Fetch from TMDB API & Upsert (Self-Healing)
    // If we don't have it in DB, we fetch it live and save it.
    if (!show) {
        let tmdbData = null;
        let type = 'movie';

        try {
            // We don't know if it's a Movie or TV, so we try Movie first
            tmdbData = await TMDBService.getShowDetails('movie', id);
        } catch (err) {
            try {
                // If Movie fails (404), try TV
                tmdbData = await TMDBService.getShowDetails('tv', id);
                type = 'tv';
            } catch (err2) {
                throw new NotFoundResponse('Show not found');
            }
        }

        // Save the new show to our database
        show = await Show.create({
            tmdb_id: tmdbData.id,
            media_type: type,
            title: tmdbData.title || tmdbData.name,
            synopsis: tmdbData.overview,
            release_year: (tmdbData.release_date || tmdbData.first_air_date)?.split("-")[0],
            poster_url: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null,
            popularity: tmdbData.popularity,
            vote_average: tmdbData.vote_average
        });
    }

    // 4. Fetch Extras (Cast & Trailer)
    const [cast, trailerKey] = await Promise.all([
        Show.getCast(show),
        Show.getTrailer(show)
    ]);

    const data = { 
        ...show, 
        cast, 
        trailer_url: trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : null 
    };

    return new SuccessResponse('Show details retrieved', data).send(res);
};

module.exports = { getPopularShows, searchShows, getShowDetails };
