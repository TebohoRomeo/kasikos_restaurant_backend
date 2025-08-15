const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/:restaurantId', requireAuth, reviewController.createReview);
router.get('/:restaurantId', reviewController.listReviews);

module.exports = router;
