const router = require("express").Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { login, logout, auth } = require("../middleware/auth");
require("dotenv").config();

// Get User(s) | Admin Route
router.get("/data/:id?", auth(true), async (req, res) => {
    try {
        const { id } = req.params;
        const data = await User.findAll(!id ? {} : { where: { id } });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

// Sign Up New User
router.post("/", async (req, res) => {
    try {
        // Validation
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send("Username and password are required fields.");
        };

        // Password Hashing
        const passSalt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(password, passSalt);

        // User Creation and Login
        const newUser = await User.create({ username, password: passHash });
        login(req.session, newUser);

        return res.status(200).send("New user created successfully");
    } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        // Validation
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send("Username and password are required fields.");
        };

        // Find User and check if exists
        const loginUser = await User.findOne({ where: { username } });
        if (!loginUser) {
            return res.status(401).send("Incorrect credentials, please try again.");
        };

        // Validate password hash
        const passCorrect = await bcrypt.compare(password, loginUser.password);
        if (!passCorrect) {
            return res.status(401).send("Incorrect credentials, please try again.");
        };

        // Login
        login(req.session, loginUser);
        return res.status(200).send("Successfully logged in");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error")
    }
});

// Logout
router.get("/logout", auth(false), (req, res) => {
    logout(req.session);
    return res.status(200).send("Successfully logged out");
});

// Update User
// Seperate route eventually to have secure password update
router.put("/update/:id", auth(false), async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        // Validation
        if (!id || !username) {
            return res.status(400).send("Missing required field(s).");
        };
        // Users can only update their own question (unless admin user)
        if (req.user.id !== id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized.");
        };

        await User.update({ username }, { where: { id } });
        return res.status(200).send(`User ${id} updated successfully.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

router.put("/admin", auth(true), async (req, res) => {
    try {
        const { id, secret } = req.body;
        
        // Validation
        if (!id || !secret) {
            return res.status(400).send("Missing required field(s)");
        };
        if (secret !== process.env.ADMIN_SECRET) {
            return res.status(400).send("Unauthorized");
        };

        await User.update({ admin_ind: true }, { where: { id } });
        return res.status(200).send(`User ${id} successfully updated to admin.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error")
    }
});

// Soft Delete
router.put("/soft/:id", auth(false), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validation
        if (!id) {
            return res.status(400).send("Missing required field(s)");
        };
        // Users can only soft delete their own questions (unless admin user)
        if (req.user.id !== id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized");
        };

        await User.update({ active_ind: false }, { where: { id } });

        // If the user deletes their profile, automatically log the out.
        logout(req.session);
        return res.status(200).send(`User ${id} successfully deleted (Soft).`);
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
            return res.status(400).send("User Id is a required parameter.");
        };

        await User.destroy({ where: { id } });
        return res.status(200).send(`User ${id} successfully deleted (Hard).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Testing route, delete later
router.get("/session", (req, res) => {
    return res.json(req.session)
});

module.exports = router;