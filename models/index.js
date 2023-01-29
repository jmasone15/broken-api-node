// Depedencies
const { DataTypes } = require("sequelize");

// Models
const User = require("./User");
const Question = require("./Question");
const Answer = require("./Answer");
const PassReset = require("./PassReset");

// User Associations
User.hasMany(Question, {
    foreignKey: {
        name: "user_id",
        type: DataTypes.UUID,
        allowNull: false
    }
});
User.hasMany(Answer, {
    foreignKey: {
        name: "user_id",
        type: DataTypes.UUID,
        allowNull: false
    }
});

// Question Associations
Question.belongsTo(User, {
    foreignKey: {
        name: "user_id",
        type: DataTypes.UUID,
        allowNull: false
    }
});
Question.hasMany(Answer, {
    foreignKey: {
        name: "question_id",
        type: DataTypes.UUID,
        allowNull: false
    }
});

// Answer Associations
Answer.belongsTo(Question, {
    foreignKey: {
        name: "question_id",
        type: DataTypes.UUID,
        allowNull: false
    }
});
Answer.belongsTo(User, {
    foreignKey: {
        name: "user_id",
        type: DataTypes.UUID,
        allowNull: false
    }
});

// Export
module.exports = {
    User,
    Question,
    Answer,
    PassReset
};