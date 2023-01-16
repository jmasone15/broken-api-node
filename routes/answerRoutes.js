const router = require("express").Router();
const { Answer } = require("../models");

router.get("/:active?", async (req, res) => {
    try {
        const data = await Answer.findAll({ where: {active_ind: req.params.active || true } });
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
            return res.status(400).send("Answer Id is a required field.");
        };

        const data = await Answer.findOne({ where: { id }});
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.post("/", async (req, res) => {
    try {
        const { response } = req.body;
        if (!response) {
            res.status(400).send("Response is a required field.");
        };

        const newAnswer = await Answer.create({ response });
        res.status(200).json(newAnswer);
    } catch (err) {
        console.error(err)
        res.status(500).send("Internal Server Error")
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!id) {
            return res.status(400).send("Answer Id is a required parameter.");
        };
        if (!response) {
            return res.status(400).send("Fields to update must be provided.");
        };

        await Answer.update({ response }, { where: { id }});
        return res.status(200).send(`Response ${id} updated successfully.`);
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
            return res.status(400).send("Answer Id is a required parameter.");
        };

        await Answer.update({ active_ind: false }, { where: { id }});
        return res.status(200).send(`Answer ${id} successfully deleted (Soft).`);
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