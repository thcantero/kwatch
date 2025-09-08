"use strict"

const db = require('../config/db');
const { BadRequestError, NotFoundError } = require('../utils/expressError');

//const { } = require('../helpers/sql')

class Genre {
    /** Get all genres */
    static async getAll() {
        const result = await db.query(
            `SELECT id, genre, tmdb_id, last_updated
            FROM genres
            ORDER BY genre`
        );
        return result.rows;
    }
    
    /** Create a genre */
    static async create ({id, genre}) {
        const res = await db.query(
            `INSERT INTO genres (tmdb_id, genre)
            VALUES ($1, $2)
            RETURNING id, tmdb_id, genre, last_updated`,
            [tmdb_id, genre]
        );
    return res.rows[0];
    }

    /** Update genres from TMDB API */
  static async updateFromTMDB() {
    try {
      // Fetch genres from TMDB
      const TMDB_API_KEY = process.env.TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      const tmdbGenres = data.genres;
      
      // Get current genres from database
      const currentGenres = await this.getAll();
      const currentTmdbIds = currentGenres.map(g => g.tmdb_id);
      
      // Check if we need to update
      const newTmdbIds = tmdbGenres.map(g => g.id);
      const needsUpdate = 
        currentGenres.length === 0 || 
        currentTmdbIds.length !== newTmdbIds.length ||
        !currentTmdbIds.every(id => newTmdbIds.includes(id));
      
      if (!needsUpdate) {
        return {
          updated: false,
          message: "Genres are already up to date",
          count: currentGenres.length
        };
      }
      
      // Update genres
      await db.query('DELETE FROM genres'); // Clear existing genres
      
      for (const genre of tmdbGenres) {
        await this.create({
          tmdb_id: genre.id,
          genre: genre.genre
        });
      }
      
      return {
        updated: true,
        message: `Updated ${tmdbGenres.length} genres`,
        count: tmdbGenres.length
      };
    } catch (error) {
      throw new Error(`Failed to update genres from TMDB: ${error.message}`);
    }
  }
      
}

module.exports = Genre;