const router = require("express").Router();
const { User, Question } = require("../models");
const { logout, auth } = require("../middleware/auth");

// All Protected Routes

// Get Question(s) | Admin Route
router.get("/data/:id?", auth(true), async (req, res) => {
    // The question mark makes the URL parameter optional
    try {
        const { id } = req.params;
        // Only query by id if one is provided
        const data = await Question.findAll(!id ? {} : { where: { id } });

        if (!data) {
            return res.status(404).send("No question(s) found.");
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Get Questions for logged in user
router.get("/user", auth(false), async (req, res) => {
    try {
        // Validation
        const userData = await User.findOne({ where: { id: req.user.id } });
        if (!userData) {
            // If somehow a user is logged in that doesn't exist in our db, log them out (super edge case).
            logout(req.session);
            return res.status(404).send(`User ${req.user} not found.`)
        };

        // getQuestions() is an automatically generated sequelize method when you created a model association
        const userQuestions = await userData.getQuestions({ where: { active_ind: true } });
        return res.status(200).json(userQuestions);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Create Question
router.post("/create", auth(false), async (req, res) => {
    try {
        // Validation
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).send("Missing required field(s).");
        };

        const newQuestion = await Question.create({ title, body, user_id: req.user.id });
        return res.status(200).json(newQuestion);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Update Question
router.put("/update/:id", auth(false), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body } = req.body;

        // Validation
        if (!id) {
            return res.status(400).send("Question Id is a required field.");
        };
        if (!title && !body) {
            return res.status(400).send("Fields to update must be provided.");
        };

        // Cannot update a question that logged in user does not own (unless admin user)
        const updateQuestion = await Question.findOne({ where: { id, active_ind: true } });
        if (!updateQuestion) {
            return res.status(404).send("No Question with that id.");
        };
        if (updateQuestion.user_id !== req.user.id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized")
        };

        // set/save method is better in this situation that update method
        // update method requeries to find the record we are updating, already have the instance from validation.
        updateQuestion.set({
            title: title || updateQuestion.title,
            body: body || updateQuestion.body
        });
        updateQuestion.save();

        return res.status(200).send(`Question ${id} updated successfully.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Soft Delete
router.put("/soft/:id", auth(false), async (req, res) => {
    try {
        // Validation
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Question Id is a required parameter.");
        };

        // Cannot delete question that user does not own (unless admin user)
        const updateQuestion = await Question.findOne({ where: { id } });
        if (!updateQuestion) {
            return res.status(404).send("No Question with that id.");
        };
        if (updateQuestion.user_id !== req.user.id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized")
        };

        // same as above, update method not necessary because we already have instance available 
        updateQuestion.active_ind = false;
        updateQuestion.save();

        return res.status(200).send(`Question ${id} successfully deleted (Soft).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;