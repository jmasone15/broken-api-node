// Dependencies
const express = require("express");
const morgan = require("morgan");
const sequelize = require("./config/connection");
const routes = require("./routes");
const session = require("express-session");
const SequelizeStore = require('connect-session-sequelize')(session.Store);
require("dotenv").config();

// Initilization
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // Saving the session in the database allows for MYSQL to handle and store all session objects
    store: new SequelizeStore({
        db: sequelize
    })
}));

// Routes
app.use("/api", routes);

// Server & DB Start
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        // force: true will drop all tables an re run the models.
        // Set to true if model changes were made
        sequelize.sync({ force: false });
        console.log("MySQL Database connected successfully.", `🌎 Server Listening at: http://localhost:${PORT} 🌎`);
    } catch (error) {
        console.error("Unable to connect to the database: ", error)
    }
});