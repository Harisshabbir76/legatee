const express = require("express");
const router  = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getContent, saveContent } = require("../controllers/contactPageController");
const { uploadMiddleware, uploadImage } = require("../controllers/homepageImageController");
const { sendContactEmail } = require("../controllers/contactEmailController");
const ContactMessage = require("../models/ContactMessage");

router.get("/", getContent);
router.put("/", requireAuth, saveContent);
router.post("/upload-image", requireAuth, uploadMiddleware, uploadImage);
router.post("/send", sendContactEmail);
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});
router.patch("/messages/:id/read", requireAuth, async (req, res) => {
  try {
    await ContactMessage.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to update message." });
  }
});

module.exports = router;
