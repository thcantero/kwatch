const express = require('express');
const axios = require('axios');
//const Genre = require('../models/genre');

const {SuccessResponse, ErrorResponse} = require('../utils/responses');
const { saveShowToDB } = require('../helpers/tmdbAPI');

const router = new express.Router();

// GET /shows/ - Fetch popular shows
router.get('/', async (req, res, next) => {
    try{
        const page = req.query.page || 1;

        //Make request to API
        const response = await axios.get("https://api.themoviedb.org/3/discover/tv", {
            params: {
                api_key : process.env.TMDB_API,
                with_origin_country : "KR",
                page,
            },
        })

        //Save all shows to db
        //const savePromises = response.data.results.map(showData => saveShowToDB(showData));
        //await Promise.allSettled(savePromises);   

        return new SuccessResponse("Fetched popular dramas", response.data).send(res);

    } catch(e) {
        console.error(e);
        return next(new ErrorResponse(500, "Failed to fetch Dramas"));
}
});

// GET /shows/genres - Get all genres
router.get('/genres', async (req, res, next) => {
  try {
    const genres = await Genre.getAll();
    return new SuccessResponse("Fetched genres", genres).send(res);
  } catch (e) {
    console.error(e);
    return next(new ErrorResponse(500, "Failed to fetch genres"));
  }
});


// GET /search         → Search shows (query TMDB API + cache results to DB)

// GET /:id            → Get specific show (check DB first, then TMDB if not found)

// GET /:id/actors     → Get show's actors (from DB)

// POST /:id/reviews   → Create review (save to DB)





// GET /shows/filter by different filters
// router.get('/search', async (req, res, next) => {
//     try{
//         const page = req.query.page || 1;

//         // Get the genre list from TMDB use it to populate the drop down dont save
//         check if its same as we have in the db if not, store it 
//         // the DB

//         //Rest of the route https://developer.themoviedb.org/reference/discover-tv
        
//     }
// });

// GET /shows/:id - Get shows details

module.exports = router;