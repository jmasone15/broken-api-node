const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
    // User being "logged in" is determined by the existence of a JWT in the payload property of the session object.
    login(session, { id, admin_ind }) {
        const payload = jwt.sign({ user: { id, admin_ind } }, process.env.JWT_SECRET);
        session.payload = payload;
    },
    logout(session) {
        session.payload = null;
    },
    auth(admin) {
        return (req, res, next) => {
            try {
                // Is there a current existing session?
                const { payload } = req.session;
                if (!payload) {
                    return res.status(401).send("Unauthorized");
                };

                // Is the session toke a verified JWT?
                const verify = jwt.verify(payload, process.env.JWT_SECRET);
                if (!verify) {
                    return res.status(401).send("Unauthorized");
                };

                // If required, is the user an admin user?
                if (admin && !verify.user.admin_ind) {
                    return res.status(401).send("Unauthorized");
                };

                // Update the request object with the decoded jwt payload
                req.user = verify.user;
                return next();
            } catch (error) {
                console.error(error);
                return res.status(500).send("Internal Server Error");
            }
        }
    },
    sameUser(req, id) {
        return req.user === id
    }
}