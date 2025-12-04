/** Database setup for KWatch */

const { Pool } = require("pg");
const { getDatabaseURI } = require('../config')

let db;

if( process.env.NODE_ENV === "production") {
    db = new Pool({
        connectionString: getDatabaseURI(),
        ssl:{
            rejectUnauthorized: false
        }
    });
} else {
    db = new Pool({
        connectionString: getDatabaseURI()
    });
}

// Only call db.connect() in non-test environments
if (process.env.NODE_ENV !== 'test') {
    db.connect()
        .then(() => console.log("✅ Database connected"))
        .catch(err => console.error("❌ Database connection error:", err));
}

module.exports = {db};