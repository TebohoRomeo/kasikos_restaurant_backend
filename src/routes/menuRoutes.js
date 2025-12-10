import { Router } from 'express';
const router = Router();
import upload from '../config/multer.js';
import { createMenuItem, listMenus } from '../controllers/menuController.js';
import { requireAuth, requireRestaurantOwner } from '../middleware/authMiddleware.js';

router.post('/', createMenuItem); // requireAuth, requireRestaurantOwner -- set let restrictions for piloting
router.post('/:menuId/items', requireAuth, requireRestaurantOwner, upload.single('image'), createMenuItem);
router.get('/restaurant/:restaurantId', listMenus);
router.get('/:menuId/items', listMenus);

export default router;
