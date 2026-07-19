const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { get, update } = require("../controllers/shippingController");

// Public — checkout reads the shipping price.
router.get("/", get);

// Admin-only — managed from the dashboard.
router.put("/", requireAuth, update);

module.exports = router;
