const express = require('express');
const router = express.Router();
const ziina = require('../controllers/ziinaController');

router.post('/create-intent', ziina.createPaymentIntent);
router.get('/order-by-intent/:intentId', ziina.getOrderByIntent);
router.post('/webhook', ziina.handleZiinaWebhook);

module.exports = router;
