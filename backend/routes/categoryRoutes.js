const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { list, create, update, remove, uploadMiddleware, uploadImage } = require("../controllers/categoryController");

// Public
router.get("/", list);

// Admin-only
router.post("/", requireAuth, create);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);
router.post("/:id/image", requireAuth, uploadMiddleware, uploadImage);

module.exports = router;
