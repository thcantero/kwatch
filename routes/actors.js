const express = require('express');
const axios = require('axios');
//const Genre = require('../models/genre');

const {SuccessResponse, ErrorResponse} = require('../utils/responses');
const { saveActorToDB } = require('../helpers/tmdbAPI');

const router = new express.Router();

// GET / - Get all actors (with pagination)

// GET /search - Search actors by name

// GET /:id - Get actor details

// GET /:id/shows - Get shows for an actor