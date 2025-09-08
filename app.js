/** App for KDrama Tracking and Social Hub */

"use strict";

require("dotenv").config();

const express = require('express');
const app = express();


//Import error handlers
const ExpressError = require('./utils/expressError');
const { notFound, errorHandler } = require("./middleware/errorHandler");
const morgan = require('morgan')

//How to add favicon.ico ???
app.get('/favicon.ico', (req, res) => res.status(204).end());

//Import routes
const authRoutes = require('./routes/auth');
const showsRoutes = require('./routes/shows');

app.use(express.json())

//Use routes
app.use('/auth', authRoutes);
app.use('/shows', showsRoutes);
app.use(morgan('dev'))

//404 handler - if no route is matched
app.use(notFound)

//General error handler
app.use(errorHandler);

// TMDB API token (if needed elsewhere)
const Tmdb_Token =  process.env.TMDB_API;

module.exports = app;