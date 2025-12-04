// controllers/genreController.js
const Genre = require('../models/Genre');
const { SuccessResponse } = require('../utils/responses');

const getAllGenres = async (req, res) => {
    const genres = await Genre.getAll();
    return new SuccessResponse('All genres retrieved', genres).send(res);
};

module.exports = { getAllGenres };