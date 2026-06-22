const express = require("express");
const router = express.Router();
const { startBreak, endBreak } = require("../controllers/breakController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/start", startBreak);
router.patch("/end", endBreak);

module.exports = router;