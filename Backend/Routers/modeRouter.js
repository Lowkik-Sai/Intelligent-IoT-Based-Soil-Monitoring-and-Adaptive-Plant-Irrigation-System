const express = require("express");
const router = express.Router();

const modeController = require("../Controllers/modeController");

router.post("/", modeController);

module.exports = router;