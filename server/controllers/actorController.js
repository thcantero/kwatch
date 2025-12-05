const Actor = require('../models/Actor');
const Follow = require('../models/Follow'); 
const { SuccessResponse, NotFoundResponse } = require('../utils/responses');

// 1. Get Popular Actors
const getPopularActors = async (req, res) => {
    const limit = req.query.limit || 20;
    const actors = await Actor.getPopular(limit);
    return new SuccessResponse('Popular actors retrieved', actors).send(res);
};

// 2. Follow Actor
const followActor = async (req, res) => {
    // FIX 1: Use res.locals.user.id (not req.user.id)
    const userId = res.locals.user.id;
    const tmdbId = req.params.id;

    // FIX 2: Translate TMDB ID -> Local Actor ID
    // We need the local ID because the 'actor_follows' table references 'actors.id' (Primary Key)
    const actor = await Actor.findByTmdbId(tmdbId);
    
    if (!actor) {
        // This handles the edge case where the actor hasn't been cached yet
        throw new NotFoundResponse("Actor not initialized in database");
    }

    await Follow.followActor(userId, actor.id);
    return new SuccessResponse('Actor followed').send(res);
};

// 3. Unfollow Actor
const unfollowActor = async (req, res) => {
    // FIX 1: Use res.locals.user.id
    const userId = res.locals.user.id;
    const tmdbId = req.params.id;

    // FIX 2: Translate TMDB ID -> Local Actor ID
    const actor = await Actor.findByTmdbId(tmdbId);
    
    if (!actor) throw new NotFoundResponse("Actor not found");

    await Follow.unfollowActor(userId, actor.id);
    return new SuccessResponse('Actor unfollowed').send(res);
};

// 4. Get Actor Details
const getActorDetails = async (req, res) => {
    const { id } = req.params;
    
    // FIX 1: Check res.locals.user (Safe check with ?.)
    const currentUserId = res.locals.user?.id; 

    const [details, credits] = await Promise.all([
        Actor.getById(id),
        Actor.getCredits(id)
    ]);

    if (!details) throw new NotFoundResponse("Actor not found");

    let isFollowing = false;
    let localId = null;

    if (currentUserId) {
        // Upsert to ensure we have a Local ID to follow
        const localActor = await Actor.create({
            tmdbId: details.id,
            name: details.name,
            photoUrl: details.profile_path ? `https://image.tmdb.org/t/p/w500${details.profile_path}` : null,
            popularity: details.popularity
        });
        
        localId = localActor.id;
        
        // Check follow status using Local ID
        isFollowing = await Follow.isFollowingActor(currentUserId, localId);
    }

    const data = { 
        ...details, 
        known_for: credits, 
        is_following: isFollowing,
        localId: localId 
    };
    
    return new SuccessResponse('Actor details retrieved', data).send(res);
};

module.exports = { 
    getPopularActors, 
    getActorDetails, 
    followActor, 
    unfollowActor 
};