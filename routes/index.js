const router = require("express").Router();
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const answerRoutes = require("./answerRoutes");
const passRoutes = require("./passwordRoutes");

router.use("/user", userRoutes);
router.use("/question", questionRoutes);
router.use("/answer", answerRoutes);
router.use("/password", passRoutes);

module.exports = router;