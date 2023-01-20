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
// Change this to use jwt and cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
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
        sequelize.sync({ force: false });
        console.log("MySQL Database connected successfully.", `🌎 Server Listening at: http://localhost:${PORT} 🌎`);
    } catch (error) {
        console.error("Unable to connect to the database: ", error)
    }
});