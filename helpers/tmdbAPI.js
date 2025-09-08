const Show = require('../models/Show');

async function saveShowToDB(tmdbShowData) {
    try {

        //Map the TMDB data to the DB schema
        const showData = {
            title : tmdbShowData.name,
            synopsis : tmdbShowData.overview,
            release_year : new Date(tmdbShowData.first_air_date).getFullYear(),
            poster_url : tmdbShowData.poster_path ? 
                `https://image.tmdb.org/t/p/w500${tmdbShowData.poster_path}` : null,
            total_episodes : tmdbShowData.number_of_episodes,
            vote_average : tmdbShowData.vote_average,
            popularity : tmdbShowData.popularity,
            tmdb_id : tmdbShowData.id
        };

        //Method to insert data
        const show = await Show.createOrUpdateShow(showData);
        return show;
    } catch (e) {
        console.error(`Failed to shave show ${tmdbShowData.id} to DB:`, e.message);
    }
}

module.exports = { saveShowToDB }

