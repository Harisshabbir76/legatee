const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { create, list, getOne, updateStatus } = require("../controllers/orderController");

// Public — customers place orders from the storefront checkout.
router.post("/", create);

// Admin-only — must be before /:id so the literal "/" isn't caught as an id.
router.get("/", requireAuth, list);

// Public — fetch a single order by ID (used on the success page).
router.get("/:id", getOne);

router.patch("/:id", requireAuth, updateStatus);

module.exports = router;
