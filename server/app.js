//Load environment variables
require('dotenv').config();

const express = require('express');
//const ExpressError = require('./utils/ExpressError')

//Initialize app variable
const app = express();

    // ----- IMPORTS 

        //Middleware
        const { authenticateJWT } = require("./middleware/auth")
        const {notFound, errorHandler} = require('./middleware/errorHandler')
        
        app.use(express.json());
       
        //Routes
        const showRoutes = require('./routes/shows');
        const genreRoutes = require('./routes/genres');
        const actorRoutes = require('./routes/actors');
        const authRoutes = require("./routes/auth");
        const userRoutes = require("./routes/users");
        const watchlistRoutes = require("./routes/watchlist");
        const reviewRoutes = require("./routes/reviews");
        const commentRoutes = require("./routes/comments");
        const feedRoutes = require("./routes/feed");

        //Models

    // ----- MIDDLEWARE

        // This checks for a token on every single request
        app.use(authenticateJWT);

        //Mount Routes
        app.use('/api/v1/shows', showRoutes);
        app.use('/api/v1/genres', genreRoutes);
        app.use('/api/v1/actors', actorRoutes);
        app.use("/api/v1/auth", authRoutes);
        app.use("/api/v1/users", userRoutes);
        app.use("/api/v1/watchlist", watchlistRoutes);
        app.use("/api/v1/reviews", reviewRoutes);
        app.use("/api/v1/comments", commentRoutes);
        app.use("/api/v1/feed", feedRoutes);

        //Error handling

            //Catch 404s (If request didn't match any route above)
            app.use(notFound);
            
            //Global Error Handler (Catches all errors)
            app.use(errorHandler);
    

    module.exports = app;





