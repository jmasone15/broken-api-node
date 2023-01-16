const router = require("express").Router();
const { User } = require("../models");

router.get("/:id?", async (req, res) => {
    try {
        const { id } = req.params;

        const data = await User.findAll(!id ? {} : { where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send("Username and password are required fields.");
        };

        const newUser = await User.create({ username, password });
        return res.status(200).json(newUser);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        if (!id) {
            return res.status(400).send("User Id is a required parameter.");
        };
        if (!username && !password) {
            return res.status(400).send("Fields to update must be provided.");
        };

        await User.update({ username, password }, { where: { id } });
        return res.status(200).send(`User ${id} updated successfully.`);
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
            return res.status(400).send("User Id is a required parameter.");
        };

        await User.update({ active_ind: false }, { where: { id } });
        return res.status(200).send(`User ${id} successfully deleted (Soft).`);
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
            return res.status(400).send("User Id is a required parameter.");
        };

        await User.destroy({ where: { id } });
        return res.status(200).send(`User ${id} successfully deleted (Hard).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;