const router = require("express").Router();
const { User, Question } = require("../models");
const { logout, auth } = require("../middleware/auth");

// All Protected Routes

// Get Question(s) | Admin Route
router.get("/data/:id?", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Question.findAll(!id ? {} : { where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Get Questions for logged in user
router.get("/user", auth, async (req, res) => {
    try {
        // Validation
        const userData = await User.findOne({ where: { id: req.user } });
        if (!userData) {
            // If somehow a user is logged in that doesn't exist in our db, log them out (super edge case).
            logout(req.session);
            return res.status(400).send(`User ${req.user} not found.`)
        };

        const userQuestions = await userData.getQuestions();
        return res.status(200).json(userQuestions);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Create Question
router.post("/", auth, async (req, res) => {
    try {
        // Validation
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).send("Missing required field(s).");
        };

        const newQuestion = await Question.create({ title, body, user_id: req.user });
        return res.status(200).json(newQuestion);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

// Update Question
router.put("/:id", auth, async (req, res) => {
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
        const updateQuestion = Question.findOne({ where: { id }});
        if (!updateQuestion) {
            return res.status(400).send("No Question with that id.");
        };
        if (updateQuestion.user_id !== req.user) {
            return res.status(401).send("Unauthorized")
        };

        // set method is better in this situation that update method
        // update method requeries to find the record we are updating, already have the instance from validation with set.
        await updateQuestion.set({
            title,
            body
        });
        return res.status(200).send(`Question ${id} updated successfully.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Soft Delete
router.put("/soft/:id", auth, async (req, res) => {
    try {
        // Validation
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Question Id is a required parameter.");
        };

        // Cannot delete question that user does not own (unless admin user)
        const updateQuestion = Question.findOne({ where: { id }});
        if (!updateQuestion) {
            return res.status(400).send("No Question with that id.");
        };
        if (updateQuestion.user_id !== req.user) {
            return res.status(401).send("Unauthorized")
        };

        // same as above, update method not necessary because we already have instance available 
        updateQuestion.active_ind = false;
        await updateQuestion.save()
        return res.status(200).send(`Question ${id} successfully deleted (Soft).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Hard Delete | Admin Route
router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Question Id is a required parameter.");
        };

        await Question.destroy({ where: { id } });
        return res.status(200).send(`Question ${id} successfully deleted (Hard).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;