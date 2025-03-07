const express = require("express");
const router = express.Router();

const getStats = require("./Routers/getStatsRouter");
const mode = require("./Routers/modeRouter");

router.use("/getstats", getStats);
router.use("/mode", mode);

module.exports = router;