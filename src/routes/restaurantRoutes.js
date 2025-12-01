const express = require('express');
const  { updateProfile, changePassword } = require('../controllers/restaurantController.js');
const { requireAuth } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);

export default router;
