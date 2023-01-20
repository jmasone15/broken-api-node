const router = require("express").Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { login, logout, auth } = require("../middleware/auth");

router.get("/data/:id?", async (req, res) => {
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

        const passSalt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(password, passSalt);

        const newUser = await User.create({ username, password: passHash });
        login(req.session, newUser.id);
        return res.status(200).send("New user created successfully");
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send("Username and password are required fields.");
        };

        const loginUser = await User.findOne({ where: { username } });
        if (!loginUser) {
            return res.status(401).send("Incorrect credentials, please try again.");
        };

        const passCorrect = await bcrypt.compare(password, loginUser.password);
        if (!passCorrect) {
            return res.status(401).send("Incorrect credentials, please try again.");
        };

        login(req.session, loginUser.id);
        return res.status(200).send("Successfully logged in");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error")
    }
});

// Testing route, delete later
router.get("/session", (req, res) => {
    res.json(req.session)
});

router.get("/logout", (req, res) => {
    logout(req.session);
    res.status(200).send("Successfully logged out");
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