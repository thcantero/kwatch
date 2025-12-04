const { db } = require("../config/db");
const TMDBService = require("../services/tmdb");

class Genre {
    /**
     * Get all genres.
     * Logic: Check DB -> If empty, Fetch API (Movies + TV) -> Merge -> Save -> Return
     */
    static async getAll() {
        // 1. Check DB
        const dbRes = await db.query(
            `SELECT id, tmdb_id, genre FROM genres ORDER BY genre ASC`
        );

        if (dbRes.rows.length > 0) {
            return dbRes.rows;
        }

        // 2. Fetch from API
        console.log("⚠️ Genres missing. Fetching from TMDB...");
        const [movieRes, tvRes] = await Promise.all([
            TMDBService.getMovieGenres(),
            TMDBService.getTVGenres()
        ]);

        // 3. Merge & Deduplicate (using Map by TMDB ID)
        const genreMap = new Map();
        if (movieRes.genres) movieRes.genres.forEach(g => genreMap.set(g.id, g.name));
        if (tvRes.genres) tvRes.genres.forEach(g => genreMap.set(g.id, g.name));

        // 4. Save to DB
        const savedGenres = [];
        for (const [tmdbId, name] of genreMap.entries()) {
            const genre = await Genre.create({ tmdbId, name });
            savedGenres.push(genre);
        }

        return savedGenres.sort((a, b) => a.genre.localeCompare(b.genre));
    }

    static async create({ tmdbId, name }) {
        const res = await db.query(
            `INSERT INTO genres (tmdb_id, genre)
             VALUES ($1, $2)
             ON CONFLICT (tmdb_id) DO UPDATE SET genre = EXCLUDED.genre
             RETURNING id, tmdb_id, genre`,
            [tmdbId, name]
        );
        return res.rows[0];
    }
}

module.exports = Genre;