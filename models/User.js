const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/connection");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    admin_ind: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

module.exports = User;