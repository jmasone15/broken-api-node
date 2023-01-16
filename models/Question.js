const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/connection");

const Question = sequelize.define("Question",
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            unique: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        body: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active_ind: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        sequelize,
        timestamps: true,
        createdAt: "created_tmstmp",
        updatedAt: "updated_tmstmp"
    }
);

module.exports = Question;