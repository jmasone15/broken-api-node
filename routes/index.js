const router = require("express").Router();
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const answerRoutes = require("./answerRoutes");

router.use("/user", userRoutes);
router.use("/question", questionRoutes);
router.use("/answer", answerRoutes);

// Login System w/ protected routes
// Password hashing
// Only User can update their own questions / answers
// Admin user with full control
// Send Email notifications
module.exports = router;