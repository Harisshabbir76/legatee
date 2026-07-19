const router = require("express").Router();
const multer = require("multer");
const requireAuth = require("../middleware/requireAuth");
const { list, listHomepage, getOne, getBySlug, create, update, remove } = require("../controllers/productController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Public — the storefront reads the catalog without being logged in as admin.
router.get("/", list);
router.get("/homepage", listHomepage);
router.get("/slug/:slug", getBySlug);
router.get("/:id", getOne);

// Admin-only — managed from the dashboard.
router.post("/", requireAuth, upload.any(), create);
router.put("/:id", requireAuth, upload.any(), update);
router.delete("/:id", requireAuth, remove);

module.exports = router;
