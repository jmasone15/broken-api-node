const router = require("express").Router();
const { Question } = require("../models");

router.get("/:id?/:user_id?/active?", async (req, res) => {
    try {
        const { id, user_id, active } = req.params;
        const where = {};

        if (id) {
            where.id = id
        }
        if (user_id) {
            where.user_id = user_id
        }
        if (active) {
            where.active_ind = active
        }

        console.log(where);

        const data = await Question.findAll({ where });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Question Id is a required parameter.");
        };

        const data = await Question.findOne({ where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, body, user_id } = req.body;
        if (!title || !body || !user_id) {
            return res.status(400).send("Missing required field(s).");
        };

        const newQuestion = await Question.create({ title, body, user_id });
        return res.status(200).json(newQuestion);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body } = req.body;

        if (!id) {
            return res.status(400).send("Question Id is a required field.");
        }
        if (!title && !body) {
            return res.status(400).send("Fields to update must be provided.");
        }

        await Question.update({ title, body }, { where: { id } });
        return res.status(200).send(`Question ${id} updated successfully.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Soft Delete
router.put("/soft/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("Question Id is a required parameter.");
        };

        await Question.update({ active_ind: false }, { where: { id } });
        return res.status(200).send(`Question ${id} successfully deleted (Soft).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Hard Delete
router.delete("/:id", async (req, res) => {
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