import express from 'express';
import * as restaurantCtrl from '../controllers/restaurantController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
const router = express.Router();

router.put('/profile', requireAuth, restaurantCtrl.updateProfile);
router.put('/password', requireAuth, restaurantCtrl.changePassword);

export default router;
