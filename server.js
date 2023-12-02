const express = require('express');
const app = express();
const routes = require('./routes');

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Load routes from routes/index.js
app.use('/', routes);

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
