const express = require("express");
const router  = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getContent, saveContent } = require("../controllers/contactPageController");
const { uploadMiddleware, uploadImage } = require("../controllers/homepageImageController");
const { sendContactEmail } = require("../controllers/contactEmailController");

router.get("/", getContent);
router.put("/", requireAuth, saveContent);
router.post("/upload-image", requireAuth, uploadMiddleware, uploadImage);
router.post("/send", sendContactEmail);

module.exports = router;
