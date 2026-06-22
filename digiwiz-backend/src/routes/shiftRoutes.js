const express = require("express");
const router = express.Router();
const { startShift, endShift, getActiveShift } = require("../controllers/shiftController");
const { protect } = require("../middleware/auth");

router.use(protect); // all shift routes require login

router.post("/start", startShift);
router.patch("/end", endShift);
router.get("/active", getActiveShift);

module.exports = router;