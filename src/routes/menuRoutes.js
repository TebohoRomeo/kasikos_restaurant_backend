const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const menuController = require('../controllers/menuController');
const { requireAuth, requireRestaurantOwner } = require('../middleware/authMiddleware');

router.post('/', menuController.createMenuItem); // requireAuth, requireRestaurantOwner -- set let restrictions for piloting
router.post('/:menuId/items', requireAuth, requireRestaurantOwner, upload.single('image'), menuController.createMenuItem);
router.get('/restaurant/:restaurantId', menuController.listMenus);
router.get('/:menuId/items', menuController.listMenus);

module.exports = router;
