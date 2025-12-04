const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { getAllGenres } = require('../controllers/genreController');

router.get('/', asyncHandler(getAllGenres));

module.exports = router;

//GET	/api/genres - Returns a list of all available genres to populate your dropdowns.

//GET	/api/genres/:id/shows   - Get all shows for a specific genre ID. 