// ----- IMPORTS 

    //Packages

    //Responses

    //Models

    //Helpers

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { getPopularActors } = require('../controllers/actorController');

router.get('/popular', asyncHandler(getPopularActors));

module.exports = router;
// ----- ROUTES

    //GET /actors/:id - Get Actor Bio & Photo. **DB + TMDB

    router.get('/', async(req, res, next) => {

    })

    //GET /api/actors/:id/credits   - Get other shows this actor is in. **DB + TMDB