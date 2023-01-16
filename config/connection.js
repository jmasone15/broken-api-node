const Sequelize = require("sequelize");
require("dotenv").config();

// Sequelize class accepts a URI or a set of login parameters.
const sequelize = process.env.JAWSDB_URL ? new Sequelize(process.env.JAWSDB_URL) : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: "localhost",
        dialect: "mysql",
        port: 3306,
        // logging: (...msg) => console.log(msg)
    }
)

module.exports = sequelize; 