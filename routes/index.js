const router = require("express").Router();
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const answerRoutes = require("./answerRoutes");

router.use("/user", userRoutes);
router.use("/question", questionRoutes);
router.use("/answer", answerRoutes);

// One reusable file since the routes are similar?
module.exports = router;