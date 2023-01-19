const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
    login(session, { id, username }) {
        const payload = jwt.sign({ id, username }, process.env.JWT_SECRET);
        session = {
            ...session,
            payload
        }
        return console.log(session);
    },
    auth(req, res, next) {
        try {
            if (!session) {
                return res.status(401).send("Unauthorized");   
            };
    
            const verify = jwt.verify(session.payload, process.env.JWT_SECRET);
            if (!verify) {
                return res.status(401).send("Unauthorized");
            }
    
            req.user = verify.payload;
            return next();
    
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    }
}