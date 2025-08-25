/** App for KDrama Tracking and Social Hub */

"use strict";

require("dotenv").config();

const express = require('express');
const app = express();

const Tmdb_Token =  process.env.TMDB_API

const ExpressError = require('./expressError.js');

module.exports = app;