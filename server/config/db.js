/** Database setup */
const { Pool } = require("pg");
const { getDatabaseURI } = require('../config'); 

console.log("Attempting DB connection...");

const databaseUri = getDatabaseURI();
const env = process.env.NODE_ENV || "development";

let db;

switch(env) {
    case "test":
        // Test database - local, no SSL
        console.log("🧪 Test environment - local DB, no SSL");
        db = new Pool({
            connectionString: databaseUri
        });
        break;
        
    case "development":
        // Development - local, no SSL
        console.log("💻 Development environment - local DB, no SSL");
        db = new Pool({
            connectionString: databaseUri
        });
        break;
        
    case "production":
    default:
        // Production - remote, SSL required
        console.log("🚀 Production environment - remote DB with SSL");
        db = new Pool({
            connectionString: databaseUri,
            ssl: { rejectUnauthorized: false }
        });
}

// Test connection
db.query('SELECT NOW()')
    .then(res => {
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
        console.log("Timestamp from DB:", res.rows[0].now);
    })
    .catch(err => {
        console.error("❌ DATABASE CONNECTION ERROR:", err.message);
    });

module.exports = { db };
