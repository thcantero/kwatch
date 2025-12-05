const app = require("./app");
const { PORT } = require('./config');

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});


const server = app.listen(PORT, function() {
    console.log(`✅ Server running on http://localhost:${PORT}`);
})

module.exports = server;