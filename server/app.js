//Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
//const ExpressError = require('./utils/ExpressError')

//Initialize app variable
const app = express();

    // ----- IMPORTS 

        //Middleware
        const { authenticateJWT } = require("./middleware/auth")
        const {notFound, errorHandler} = require('./middleware/errorHandler')
        
        app.use(express.json());

        // ----- ROUTES

            // Root route - must come before other middleware
            app.get('/', (req, res) => {
                res.json({
                    message: 'KWatch API',
                    status: 'running',
                    version: '1.0.0',
                    documentation: '/api/v1/shows, /api/v1/users, etc.',
                    health: '/health',
                    timestamp: new Date().toISOString()
                });
            });

            // Health check route
            app.get('/health', async (req, res) => {
                try {
                    // Test database connection
                    const result = await db.query('SELECT NOW()');
                    res.json({
                        status: 'healthy',
                        server: 'running',
                        database: 'connected',
                        timestamp: result.rows[0].now
                    });
                } catch (error) {
                    res.status(503).json({
                        status: 'unhealthy',
                        server: 'running',
                        database: 'disconnected',
                        error: error.message
                    });
                }
            });
        
            //Other routes
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

        //Allows all connections 
        app.use(cors());

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





