const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
    login(session, id) {
        const payload = jwt.sign({ user: id }, process.env.JWT_SECRET);
        session.payload = payload;
    },
    logout(session) {
        session.payload = null;
    },
    auth(req, res, next) {
        try {
            const { payload } = req.session;
            if (!payload) {
                return res.status(401).send("Unauthorized");   
            };
    
            const verify = jwt.verify(payload, process.env.JWT_SECRET);
            if (!verify) {
                return res.status(401).send("Unauthorized");
            }
            
            req.user = verify.user;
            return next();   
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    }
}