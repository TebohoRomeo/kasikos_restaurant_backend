const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/assign/:orderId', requireAuth, deliveryController.assignDriver);
router.patch('/driver/:driverId/location', requireAuth, deliveryController.updateLocation);

module.exports = router;
