const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
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
                const { payload } = req.session;
                if (!payload) {
                    return res.status(401).send("Unauthorized");
                };

                const verify = jwt.verify(payload, process.env.JWT_SECRET);
                if (!verify) {
                    return res.status(401).send("Unauthorized");
                };

                if (admin && !verify.user.admin_ind) {
                    return res.status(401).send("Unauthorized");
                };

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