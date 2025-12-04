//Shows & movies

//GET   /api/shows  - Get a list of shows (for Homepage) **DB only

//GET   /api/shows/search   - Search shows. Query: ?q=Glory. **(DB + TMDB)

//GET   /api/shows/:id  - Get details (Synopis, Cast).	**(DB + TMDB)

//GET	/api/shows/:id/streaming    - Get "Where to Watch" links. **(Cache + TMDB)

//GET	/api/shows/:id/reviews  - Get all user reviews for this show. **DB only

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { 
    getPopularShows, 
    searchShows, 
    getShowDetails 
} = require('../controllers/showController');

router.get('/popular', asyncHandler(getPopularShows));
router.get('/search', asyncHandler(searchShows));
router.get('/:id', asyncHandler(getShowDetails));

module.exports = router;