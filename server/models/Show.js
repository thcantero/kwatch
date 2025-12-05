const { db } = require("../config/db");
const TMDBService = require("../services/tmdb");
const { NotFoundResponse } = require("../utils/responses"); 
class Show {
    
    /** * * 1. Checks DB for popular shows.
     * 2. If empty or old, fetches from TMDB Service.
     * 3. Saves to DB.
     * 4. Returns data.
     */
    static async getPopular(limit = 20) {
        // 1. Check DB first (Cache Layer)
        const dbRes = await db.query(
            `SELECT id, tmdb_id, title, poster_url, popularity, vote_average, release_year, media_type
                FROM shows 
                ORDER BY popularity DESC 
                LIMIT $1`, 
                [limit]
        );

        // If we have data, return it immediately!
        if (dbRes.rows.length > 0) {
            return dbRes.rows;
        }

        // 2. If DB is empty, fetch from Service (API Layer)
        console.log("Cache miss! Fetching from TMDB...");
        const movies = await TMDBService.getPopularMovies();
        const tv = await TMDBService.getPopularTV();

        // 3. Process and Save (Business Logic Layer)
        // We combine the lists and map them to your schema
        const combined = [
            ...movies.results.map(m => ({ ...m, media_type: 'movie' })),
            ...tv.results.map(t => ({ ...t, media_type: 'tv', title: t.name, release_date: t.first_air_date }))
        ];

        const savedShows = [];

        for (const item of combined) {
            const show = await Show.create({
                tmdb_id: item.id,
                media_type: item.media_type,
                title: item.title,
                synopsis: item.overview, // Maps TMDB 'overview' to DB 'synopsis'
                release_year: item.release_date ? parseInt(item.release_date.split("-")[0]) : null,
                poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                popularity: item.popularity,
                vote_average: item.vote_average
            });
            savedShows.push(show);
        }

        // Return the newly saved data
        return savedShows.slice(0, limit);
    }

    /**
     * Internal method to insert a single show
     */
    static async create(data) {
        const res = await db.query(
            `INSERT INTO shows 
                (tmdb_id, media_type, title, synopsis, release_year, poster_url, popularity, vote_average)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (tmdb_id, media_type) DO UPDATE 
                SET popularity = EXCLUDED.popularity
                
                RETURNING id, tmdb_id, media_type, title, poster_url, popularity`,
            [
                data.tmdb_id, 
                data.media_type, 
                data.title, 
                data.synopsis, // Value passed to synopsis column
                data.release_year, 
                data.poster_url, 
                data.popularity,
                data.vote_average
            ]
        );
        return res.rows[0];
    }

    /** * Search for shows by title.
     * Logic: TMDB Search is better than DB ILIKE usually.
     * We fetch from TMDB, save new results to DB, and return them.
     */
    static async search(query) {
        if (!query) return [];

        console.log(`🔎 Searching for: ${query}`);
        const results = await TMDBService.searchMulti(query); 

        const savedShows = [];
        for (const item of results.results) {
            // Filter out people, only want movies/tv
            if (item.media_type === 'person') continue;

            // Save to DB so we have a local copy
            const show = await Show.create({
                tmdb_id: item.id,
                media_type: item.media_type,
                title: item.title || item.name,
                synopsis: item.overview, // Maps to synopsis
                release_year: (item.release_date || item.first_air_date)?.split("-")[0] || null,
                poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                popularity: item.popularity,
                vote_average: item.vote_average
            });
            savedShows.push(show);
        }
        return savedShows;
    }

    /**
     * Get details by ID.
     * We need to join with Genres and Providers.
     */
    static async getById(id) {
        const showRes = await db.query(
            `SELECT * FROM shows WHERE id = $1`,
            [id]
        );

        const show = showRes.rows[0];
        if (!show) {
            throw new NotFoundResponse('Show not found');
        }

        return show;
    }

    // Ensure this matches the test expectation
    static async getDetails(id) {
        return this.getById(id);
    }
    
    /** Get shows by genre name */
    static async getByGenre(genreName) {
        const result = await db.query(
        `SELECT s.id, s.title, s.poster_url 
        FROM shows s
        JOIN shows_genres sg ON s.id = sg.show_id
        JOIN genres g ON sg.genre_id = g.id
        WHERE g.genre ILIKE $1`,
        [genreName]
        );
        return result.rows;
    }

}

module.exports = Show;