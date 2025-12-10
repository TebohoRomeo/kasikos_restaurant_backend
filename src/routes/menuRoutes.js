import { Router } from 'express';
const router = Router();
import upload from '../config/multer.js';
import menuController from '../controllers/menuController.js';
import { requireAuth, requireRestaurantOwner } from '../middleware/authMiddleware.js';

router.post('/', menuController.createMenuItem); // requireAuth, requireRestaurantOwner -- set let restrictions for piloting
router.post('/:menuId/items', requireAuth, requireRestaurantOwner, upload.single('image'), menuController.createMenuItem);
router.get('/restaurant/:restaurantId', menuController.listMenus);
router.get('/:menuId/items', menuController.listMenus);

export default router;
