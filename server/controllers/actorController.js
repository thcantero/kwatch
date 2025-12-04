const Actor = require('../models/Actor');
const { SuccessResponse } = require('../utils/responses');

const getPopularActors = async (req, res) => {
    const limit = req.query.limit || 20;
    const actors = await Actor.getPopular(limit);
    return new SuccessResponse('Popular actors retrieved', actors).send(res);
};

module.exports = { getPopularActors };