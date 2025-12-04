// Load environment variables from .env file
require("dotenv").config();

// Use 'colors' to make console logs prettier (optional, run 'npm i colors')
require("colors");


const PORT = process.env.PORT || 3001;

/** * Logic to decide which database URI to use.
 * 1. If we are running "npm test", use the _test database.
 * 2. If we are in production (Heroku/Render), use the DATABASE_URL provided by them.
 * 3. Otherwise (localhost development), use your local database.
 */
function getDatabaseURI() {
  const env = process.env.NODE_ENV || "development";

    if (env === "test") {
        //Allow the environment to override the test DB
        return process.env.DATABASE_URL_TEST || "postgresql:///kwatch_test";
    }

    // Production / Development
    return process.env.DATABASE_URL || "postgresql:///kwatch";
    }

    // Sanity Check: In production, crash if no DB is configured
    if (process.env.NODE_ENV === "production" && !getDatabaseURI()) {
        throw new Error("❌ FATAL: No database configuration found for Production mode.");
    }

// Log the configuration 
console.log("--- Config ---".green);
console.log("PORT:".yellow, PORT.toString());
console.log("Database:".yellow, getDatabaseURI());
console.log("--- End Config ---".green);

module.exports= {
    PORT,
    getDatabaseURI,
};