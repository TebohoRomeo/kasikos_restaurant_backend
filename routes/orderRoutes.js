const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, orderController.placeOrder);
router.get('/:id', requireAuth, orderController.getOrder);

module.exports = router;
