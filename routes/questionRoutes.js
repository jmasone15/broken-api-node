const router = require("express").Router();
const { User, Question } = require("../models");
const { auth } = require("../middleware/auth");

// Admin Route
router.get("/:id?", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Question.findAll(!id ? {} : { where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get("/user", auth, async (req, res) => {
    try {
        const userData = await User.findOne({ where: { id: req.user } });
        if (!userData) {
            return res.status(400).send(`User ${req.user} not found.`)
        };

        const userQuestions = await userData.getQuestions();
        return res.status(200).json(userQuestions);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/", auth, async (req, res) => {
    try {
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

router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body } = req.body;

        if (!id) {
            return res.status(400).send("Question Id is a required field.");
        }
        if (!title && !body) {
            return res.status(400).send("Fields to update must be provided.");
        }

        // Check that question is owned by req.user before updating

        await Question.update({ title, body }, { where: { id } });
        return res.status(200).send(`Question ${id} updated successfully.`);
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
            return res.status(400).send("Question Id is a required parameter.");
        };

        // Check that question is owned by req.user before deleting

        await Question.update({ active_ind: false }, { where: { id } });
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