const { db } = require("../config/db");
const TMDBService = require("../services/tmdb");

class Actor {

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
        const [movies, tv] = await Promise.all([
            TMDBService.getPopularMovies(),
            TMDBService.getPopularTV()
        ]);
        
        // 3. Get Actors from the top 3 shows of each category
        const topContent = [
            ...movies.results.slice(0, 3).map(m => ({ ...m, type: 'movie' })),
            ...tv.results.slice(0, 3).map(t => ({ ...t, type: 'tv' }))
        ];

        const actorMap = new Map();

        for (const show of topContent) {
            const credits = await TMDBService.getCredits(show.type, show.id);
            
            // Take top 5 billed actors from each show
            for (const person of credits.cast.slice(0, 5)) {
                if (!actorMap.has(person.id)) {
                    actorMap.set(person.id, {
                        tmdbId: person.id,
                        name: person.name,
                        photoUrl: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null,
                        popularity: person.popularity
                    });
                }
            }
        }

        // 4. Save to DB
        const savedActors = [];
        const sortedActors = Array.from(actorMap.values())
                                  .sort((a, b) => b.popularity - a.popularity);

        for (const actorData of sortedActors) {
            const actor = await Actor.create(actorData);
            savedActors.push(actor);
        }

        return savedActors.slice(0, limit);
    }

    static async create({ tmdbId, name, photoUrl, popularity }) {
        // Fixed: Ensure name and photo_url update on conflict
        const res = await db.query(
            `INSERT INTO actors (tmdb_id, name, photo_url, popularity)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (tmdb_id) DO UPDATE SET 
                popularity = EXCLUDED.popularity,
                name = EXCLUDED.name,
                photo_url = EXCLUDED.photo_url
             RETURNING id, name, photo_url, popularity`,
            [tmdbId, name, photoUrl, popularity]
        );
        return res.rows[0];
    }
}

module.exports = Actor;