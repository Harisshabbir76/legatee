const express = require("express");
const router = express.Router();
const tamara = require("../controllers/tamaraController");

router.post("/session", tamara.createSession);
router.get("/order/:orderId", tamara.getPaymentStatus);
router.post("/order/:orderId/capture", tamara.capture);
router.post("/webhook", tamara.webhook);

module.exports = router;
