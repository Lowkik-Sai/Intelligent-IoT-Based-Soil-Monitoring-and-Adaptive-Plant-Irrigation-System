const express = require("express");
const router = express.Router();

const getStats = require("./Routers/getStatsRouter");

router.use("/getstats", getStats);

module.exports = router;