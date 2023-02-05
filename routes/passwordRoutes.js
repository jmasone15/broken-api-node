const router = require("express").Router();
const { User, PassReset } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");
require("dotenv").config();

// Password Reset Request
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validation
        if (!id) {
            return res.status(400).send("Missing required field(s).");
        }
        if (req.session.payload) {
            return res.status(400).send("Cannot reset password when logged in.");
        }

        // User Validation
        const updateUser = await User.findOne({ where: { id: id, active_ind: true } });
        if (!updateUser) {
            return res.status(400).send("Unknown user.")
        }

        // Password Validation
        const existingResetToken = await PassReset.findOne({ where: { user_id: id, active_ind: true } });
        if (existingResetToken) {
            const verify = jwt.verify(existingResetToken.token, process.env.JWT_SECRET);
            if (!verify) {
                return res.status(401).send("Unauthorized");
            }
            if (new Date() < new Date(verify.expires)) {
                return res.status(400).send("Already active password reset request.")
            }
        }

        // Date objects aren't great at adding additional hours, let's make our own function.
        Date.prototype.addHours = (h) => {
            this.setHours(this.getHours() + h);
            return this;
        }

        const token = jwt.sign({ expires: new Date().addHours(1) }, process.env.JWT_SECRET);
        await PassReset.create({ token: token, user_id: id });

        // Ideally we could send a link to the password reset page
        return res.status(200).send(`Password Reset Key: ${token}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

// Update New Password
router.put("/reset/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPass } = req.body;

        // Validation
        if (!token && !newPass) {
            return res.status(400).send("Missing required field(s)");
        }
        if (req.session.payload) {
            return res.status(400).send("Cannot reset password when logged in.");
        }
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!verify) {
            return res.status(401).send("Unauthorized");
        }
        if (new Date() > new Date(verify.expires)) {
            return res.status(401).send("Password Reset token has expired.");
        }

        // Record Validation
        const passReset = await PassReset.findOne({ where: { token: token, active_ind: true } });
        if (!passReset) {
            return res.status(400).send("Password reset request not found.");
        }
        const updateUser = await User.findOne({ where: { id: passReset.user_id, active_ind: true } });
        if (!updateUser) {
            return res.status(400).send("Password reset request not found.");
        }

        // Password Hashing
        const passSalt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(newPass, passSalt);

        // Update Records
        updateUser.password = passHash;
        passReset.active_ind = false;
        updateUser.save();
        passReset.save();

        return res.status(200).send("Password updated successfully.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Admin Password Reset
router.put("/admin", auth(true), async (req, res) => {
    try {
        const { id, newPass } = req.body;

        // Validation
        if (!id || !newPass) {
            return res.status(400).send("Missing required field(s)");
        }
        const updateUser = await User.findOne({ where: { id: id, active_ind: true } });
        if (!updateUser) {
            return res.status(400).send("No user found.");
        }

        // Password Hashing
        const passSalt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(newPass, passSalt);

        // Update Record
        updateUser.password = passHash;
        updateUser.save();

        return res.status(200).send("Password updated successfully.");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;