// Dependencies
const express = require("express");
const morgan = require("morgan");
const sequelize = require("./config/connection");
const routes = require("./routes");

// Initilization
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

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