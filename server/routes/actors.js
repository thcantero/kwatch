// ----- IMPORTS 

    //Packages

    //Responses

    //Models

    //Helpers

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { getPopularActors, getActorDetails } = require('../controllers/actorController');

router.get('/popular', asyncHandler(getPopularActors));
router.get('/:id', asyncHandler(getActorDetails));

module.exports = router;
