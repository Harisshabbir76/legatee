const express = require("express");
const router  = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getContent, saveContent } = require("../controllers/legalPageController");
const { uploadMiddleware, uploadImage } = require("../controllers/homepageImageController");

router.get("/", getContent);
router.put("/", requireAuth, saveContent);
router.post("/upload-image", requireAuth, uploadMiddleware, uploadImage);

module.exports = router;
