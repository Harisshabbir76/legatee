const express = require("express");
const router = express.Router();
const dhl = require("../controllers/dhlController");

router.post("/rates", dhl.getRates);
router.post("/shipments", dhl.createShipment);
router.get("/track/:trackingNumber", dhl.trackShipment);

module.exports = router;
