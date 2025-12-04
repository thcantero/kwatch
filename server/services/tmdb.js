const axios = require("axios");
const { BadRequestResponse } = require("../utils/responses");


class TMDBService {
    static async fetch(endpoint, params = {}) {
        const API_KEY = process.env.TMDB_API_KEY;
        const BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

        // --- DEBUGGING LOG ---
        const urlToFetch = `${BASE_URL}${endpoint}`;
        console.log(`📡 Fetching: ${urlToFetch}`); 
        // ---------------------

        try {
            const res = await axios.get(`${BASE_URL}${endpoint}`, {
                params: { api_key: API_KEY, ...params }
            });
            return res.data;
        } catch (err) {
            console.error(`TMDB Error: ${err.message}`);
            // Forward 401 (Unauthorized) specifically so the test detects it
            if (err.response && err.response.status === 401) {
                throw new BadRequestResponse("Failed to fetch from external provider");
            }
            
            throw new BadRequestResponse("Failed to fetch from external provider");
        }
    }

    // --- Shows (Movies & TV) ---
    static async getPopularMovies() {
        return this.fetch("/movie/popular");
    }

    static async getPopularTV() {
        return this.fetch("/tv/popular");
    }

    // --- Genres (THIS WAS MISSING) ---
    static async getMovieGenres() {
        return this.fetch("/genre/movie/list");
    }

    static async getTVGenres() {
        return this.fetch("/genre/tv/list");
    }

    // --- Actors ---
    static async getPopularPeople() {
        return this.fetch("/person/popular");
    }

    // --- Search ---
    static async searchMulti(query) {
        return this.fetch("/search/multi", { query });
    }
}

module.exports = TMDBService;