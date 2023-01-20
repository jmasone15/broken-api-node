const router = require("express").Router();
const { User, Question, Answer } = require("../models");
const { auth } = require("../middleware/auth");

// Admin Route
router.get("/:id?", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Answer.findAll(!id ? {} : { where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.get("/user", auth, async (req, res) => {
    try {
        const userData = await User.findOne({ where: { id: req.user } });
        if (!userData) {
            return res.status(400).send(`User ${req.user} not found.`)
        };

        const userAnswers = await userData.getAnswers();
        return res.status(200).json(userAnswers);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get("/question/:id", auth, async (req, res) => {
    try {
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

router.post("/", auth, async (req, res) => {
    try {
        const { response, question_id } = req.body;
        if (!response) {
            return res.status(400).send("Response is a required field.");
        };

        const newAnswer = await Answer.create({ response, question_id, user_id: req.user });
        return res.status(200).json(newAnswer);
    } catch (err) {
        console.error(err)
        res.status(500).send("Internal Server Error")
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!id) {
            return res.status(400).send("Answer Id is a required parameter.");
        };
        if (!response) {
            return res.status(400).send("Fields to update must be provided.");
        };

        // Check that question is owned by req.user before updating

        await Answer.update({ response }, { where: { id } });
        return res.status(200).send(`Response ${id} updated successfully.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Soft Delete
router.put("/soft/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Answer Id is a required parameter.");
        };
        // Check that question is owned by req.user before deleting

        await Answer.update({ active_ind: false }, { where: { id } });
        return res.status(200).send(`Answer ${id} successfully deleted (Soft).`);
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