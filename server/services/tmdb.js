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
        return this.fetch("/discover/movie", { 
            with_original_language: 'ko', 
            sort_by: 'popularity.desc',
            "vote_count.gte": 100 // Filter out low-quality noise
        });
    }

    static async getPopularTV() {
        return this.fetch("/discover/tv", { 
            with_original_language: 'ko', 
            sort_by: 'popularity.desc',
            "vote_count.gte": 50 
        });
    }

    // --- Genres 
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

    /** Fetch Actor Bio, Birthday, Place of Birth */
    static async getPersonDetails(personId) {
        return this.fetch(`/person/${personId}`);
    }

    /** Fetch movies/tv shows an actor is in */
    static async getPersonCredits(personId) {
        return this.fetch(`/person/${personId}/combined_credits`);
    }

    // --- Get Cast
    static async getCredits(mediaType, id) {
        return this.fetch(`/${mediaType}/${id}/credits`);
    } 

    // --- Search ---
    static async searchMulti(query) {
        return this.fetch("/search/multi", { query });
    }

    // --- Videos
    static async getVideos(mediaType, id) {
        return this.fetch(`/${mediaType}/${id}/videos`);
    }
}

module.exports = TMDBService;