// Dependencies
const express = require("express");
const morgan = require("morgan");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(morgan("tiny"));

// Server Start
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
});