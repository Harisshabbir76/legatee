const express = require("express");
const router = express.Router();
const tabby = require("../controllers/tabbyController");

router.post("/eligibility", tabby.checkEligibility);
router.post("/session", tabby.createSession);
router.get("/payment/:paymentId", tabby.getPaymentStatus);
router.post("/payment/:paymentId/capture", tabby.capture);
router.post("/webhook", tabby.webhook);

module.exports = router;
