"use strict";

const PORT = +process.env.PORT || 3000;

// Use dev database, testing database, or via env var, production database
function getDatabaseURI() {
    return (process.env.NODE_ENV === "test")
        ? "postgresql:///kwatch_test"
        : process.env.DATABASE_URL || "postgresql:///kwatch";
}

module.exports= {
    PORT,
    getDatabaseURI,
};