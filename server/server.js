const express = require('express');
const { PORT } = require('./config');
const app = express();

app.listen(PORT, function() {
    console.log(`✅ Server running on http://localhost:${PORT}`);
})