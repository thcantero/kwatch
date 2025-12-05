const Actor = require('../models/Actor');
const { SuccessResponse, NotFoundResponse } = require('../utils/responses');

const getPopularActors = async (req, res) => {
    const limit = req.query.limit || 20;
    const actors = await Actor.getPopular(limit);
    return new SuccessResponse('Popular actors retrieved', actors).send(res);
};

const getActorDetails = async (req, res) => {
    const { id } = req.params;
    
    // Fetch bio and credits in parallel (Pro Level Optimization)
    const [details, credits] = await Promise.all([
        Actor.getById(id),
        Actor.getCredits(id)
    ]);

    if (!details) throw new NotFoundResponse("Actor not found");

    // Combine them into one clean object
    const data = { ...details, known_for: credits };
    
    return new SuccessResponse('Actor details retrieved', data).send(res);
};

module.exports = { getPopularActors, getActorDetails };