const express = require("express");
const authRoutes = require("./authRoutes");
const progressRoutes = require("./progressRoutes");
const quizRoutes = require("./quizRoutes");
const languageRoutes = require("./languageRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/progress", progressRoutes);
router.use("/quiz", quizRoutes);
router.use("/languages", languageRoutes);

module.exports = router;