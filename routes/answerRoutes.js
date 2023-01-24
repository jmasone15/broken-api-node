const router = require("express").Router();
const { User, Question, Answer } = require("../models");
const { auth } = require("../middleware/auth");

// All Protected Routes

// Get Answer(s) | Admin Route
router.get("/data/:id?", auth(true), async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Answer.findAll(!id ? {} : { where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

// Get Answers for logged in user
router.get("/user", auth(false), async (req, res) => {
    try {
        const userData = await User.findOne({ where: { id: req.user.id } });
        if (!userData) {
            // If somehow a user is logged in that doesn't exist in our db, log them out (super edge case).
            logout(req.session);
            return res.status(400).send(`User ${req.user.id} not found.`)
        };

        const userAnswers = await userData.getAnswers();
        return res.status(200).json(userAnswers);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Get Answers for question by q_id
router.get("/question/:id", auth(false), async (req, res) => {
    try {
        // Validation
        const { id } = req.params;
        if(!id) {
            return res.status(400).send("Missing question_id field.");
        };
        const questionData = await Question.findOne({ where: { id } });
        if (!questionData) {
            return res.status(400).send(`Question ${id} not found.`)
        };

        const questionAnswers = await questionData.getAnswers();
        return res.status(200).json(questionAnswers);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Create Answer
router.post("/", auth(false), async (req, res) => {
    try {
        // Validation
        const { response, question_id } = req.body;
        if (!response || !question_id) {
            return res.status(400).send("Missing required field(s)");
        };

        // Cannot create answer for question that doesn't exist
        const parentQuestion = Question.findOne({ where: { question_id }});
        if (!parentQuestion) {
          return res.status(400).send("No Question with that id");  
        };
        // Cannot answer question that user owns
        if (parentQuestion.user_id == req.user.id) {
            return res.status(401).send("Cannot answer your own question.");
        };

        const newAnswer = await Answer.create({ response, question_id, user_id: req.user.id });
        return res.status(200).json(newAnswer);
    } catch (err) {
        console.error(err)
        res.status(500).send("Internal Server Error")
    }
});

// Update Answer
router.put("/:id", auth(false), async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        // Validation
        if (!id || !response) {
            return res.status(400).send("Missing Required Fields");
        };

        const updateAnswer = Answer.findOne({ where: { id }});
        if (!updateAnswer) {
            return res.status(400).send("No Answer with that id.");
        };

        // Can only update answer that user owns, Unless Admin
        if (updateAnswer.user_id !== req.user.id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized");
        };

        updateAnswer.response = response;
        await updateAnswer.save();

        return res.status(200).send(`Response ${id} updated successfully.`);
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
            return res.status(400).send("Answer Id is a required parameter.");
        };

        const updateAnswer = Answer.findOne({ where: { id }});
        if (!updateAnswer) {
            return res.status(400).send("No Answer with that id.");
        };
        // Cannot delete answer that user does not own (unless admin user)
        if (updateAnswer.user_id !== req.user.id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized");
        };

        updateAnswer.active_ind = false;
        await updateAnswer.save();

        return res.status(200).send(`Answer ${id} successfully deleted (Soft).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Hard Delete | Admin Route
router.delete("/:id", auth(true), async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Answer Id is a required parameter.");
        };

        await Answer.destroy({ where: { id } });
        return res.status(200).send(`Answer ${id} successfully deleted (Hard).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;