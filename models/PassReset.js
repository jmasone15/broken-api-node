const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

const PassReset = sequelize.define("PassReset", {
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.UUID,
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

module.exports = PassReset;