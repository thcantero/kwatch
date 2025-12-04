const { db } = require("../config/db");
const TMDBService = require("../services/tmdb");

class Actor {

    /**
     * Get popular actors.
     * Logic: Check DB -> If empty, Fetch API -> Save -> Return
     */
    static async getPopular(limit = 20) {
        // 1. Check DB
        const dbRes = await db.query(
            `SELECT id, name, photo_url, popularity 
             FROM actors 
             ORDER BY popularity DESC 
             LIMIT $1`,
            [limit]
        );

        if (dbRes.rows.length > 0) {
            return dbRes.rows;
        }

        // 2. Fetch API
        console.log("⚠️ Actors missing. Fetching from TMDB...");
        const data = await TMDBService.getPopularPeople();
        
        // 3. Save to DB
        const savedActors = [];
        for (const person of data.results) {
            const actor = await Actor.create({
                tmdbId: person.id,
                name: person.name,
                photoUrl: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null,
                popularity: person.popularity
            });
            savedActors.push(actor);
        }

        return savedActors.slice(0, limit);
    }

    /**
     * Internal: Insert single actor
     */
    static async create({ tmdbId, name, photoUrl, popularity }) {
        const res = await db.query(
            `INSERT INTO actors (tmdb_id, name, photo_url, popularity)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (tmdb_id) DO UPDATE SET popularity = EXCLUDED.popularity
             RETURNING id, name, photo_url, popularity`,
            [tmdbId, name, photoUrl, popularity]
        );
        return res.rows[0];
    }
}

module.exports = Actor;