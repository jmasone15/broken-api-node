const router = require("express").Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { login, logout, auth } = require("../middleware/auth");

// Get User(s) | Admin Route
router.get("/data/:id?", auth(true), async (req, res) => {
    // The question mark makes the URL parameter optional
    try {
        const { id } = req.params;
        // Only query by id if one is provided
        const data = await User.findAll(!id ? {} : { where: { id } });

        if (!data) {
            return res.status(404).send("No user(s) found.");
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Sign Up New User
router.post("/signup", async (req, res) => {
    try {
        // Validation
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send("Username and password are required fields.");
        }
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).send("Username already in use.");
        }

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
        const loginUser = await User.findOne({ where: { username } });
        if (!loginUser) {
            return res.status(401).send("Incorrect credentials, please try again.");
        };
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

        await User.update({ username }, { where: { id, active_ind: true } });
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
        }
        // Users can only soft delete their own account (unless admin user)
        if (req.user.id !== id && !req.user.admin_ind) {
            return res.status(401).send("Unauthorized");
        }

        await User.update({ active_ind: false }, { where: { id } });

        // If the user deletes their profile, automatically log them out.
        if(!req.user.admin_ind) {
            logout(req.session);
        }

        return res.status(200).send(`User ${id} successfully deleted (Soft).`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Testing route | Allows you to view the session in the database
router.get("/session", (req, res) => {
    return res.json(req.session);
});

module.exports = router;