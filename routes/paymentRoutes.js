const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/webhook', express.raw({ type: '*/*' }), paymentController.webhook); // provider may require raw body

module.exports = router;
