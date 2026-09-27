const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { list, create, remove, validate } = require("../controllers/couponController");

// Public — checkout validates a code.
router.post("/validate", validate);

// Admin-only — managed from the dashboard.
router.get("/", requireAuth, list);
router.post("/", requireAuth, create);
router.delete("/:id", requireAuth, remove);

module.exports = router;
