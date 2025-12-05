/** Database setup */
const { Pool } = require("pg");

// If db.js and config.js are in the same folder, use './config'. 
// If db.js is in a subfolder (like /db/), keep '../config'.
const { getDatabaseURI } = require('./config'); 

let db;

console.log("Attempting DB connection..."); // Debug log

if (process.env.NODE_ENV === "production") {
    db = new Pool({
        connectionString: getDatabaseURI(),
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    db = new Pool({
        connectionString: getDatabaseURI()
    });
}

// DEBUG: Force a real query to ensure connection is alive
db.query('SELECT NOW()')
    .then(res => {
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
        console.log("Timestamp from DB:", res.rows[0]);
    })
    .catch(err => {
        console.error("❌ FATAL DATABASE CONNECTION ERROR");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        console.error("Full Error:", err);
    });

module.exports = { db };