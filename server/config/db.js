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

db.connect();

module.exports = {db};