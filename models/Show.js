"use strict"

const db = require('../config/db');
const { BadRequestError, NotFoundError } = require('../utils/expressError');

class Show {
    // /** Get all shows */
    // static async getAll(){
        
    // }

    /** Creates or updates a show (Save to the DB) */
    static async createOrUpdateShow ({ title, synopsis, release_year, poster_url, total_episodes, 
                            vote_average, popularity, tmdb_id, created_at, updated_at }) {
        
        //This query inserts a new show or updates an existing one based on TMDB_id
        const res = await db.query( 
            `INSERT into shows (title, synopsis, release_year, poster_url, total_episodes, 
                            vote_average, popularity, tmdb_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (tmdb_id)
            DO UPDATE SET
                title = EXCLUDED.title,
                synopsis = EXCLUDED.synopsis,
                release_year = EXCLUDED.release_year,
                poster_url = EXCLUDED.poster_url,
                total_episodes = EXCLUDED.total_episodes,
                vote_average = EXCLUDED.vote_average,
                popularity = EXCLUDED.popularity,
                updated_at = CURRENT_TIMESTAMP
                RETURNING *`,
                [title, synopsis, release_year, poster_url, total_episodes, 
                            vote_average, popularity, tmdb_id]
        );
        return res.rows[0];
    }
}

module.exports = Show;