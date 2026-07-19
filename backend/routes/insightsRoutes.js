const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { getInsights } = require("../controllers/insightsController");

router.get("/", requireAuth, getInsights);

module.exports = router;
