const express = require("express");
const router = express.Router();

const getStats = require("../Controllers/getStatsController");

router.post("/", getStats.influxDB);
router.get("/", getStats.firebase);

module.exports = router;