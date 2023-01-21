const router = require("express").Router();
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const answerRoutes = require("./answerRoutes");

router.use("/user", userRoutes);
router.use("/question", questionRoutes);
router.use("/answer", answerRoutes);

// Only User can update their own questions / answers
// Admin user with full control
// Send Email notifications
// Password Reset
module.exports = router;