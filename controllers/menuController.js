const menuItemModel = require('../models/menuItemModel');
const storageService = require('../services/storageService');

/**
 * POST /api/menus/:menuId/items
 * auth + requireRestaurantOwner
 * single file: image
 */

async function createMenuItem(req, res, next) {
  try {
    const restaurantId = req.user.restaurant_id || req.user.restaurant_id;
    const { menuId } = req.params;
    const { name, description, price, currency } = req.body;

    if (!name || !price) return res.status(400).json({ error: 'name and price required' });

    // handle file -> storage
    const file = req.file;
    const uploaded = await storageService.upload(file);

    const item = await menuItemModel.createMenuItem({
      menuId,
      name,
      description,
      price,
      currency,
      imageUrl: uploaded ? uploaded.url : null
    });

    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function listMenus(req, res, next) {
  try {
    const restaurantId = req.params.restaurantId || req.user.restaurant_id;
    const menus = await menuModel.findByRestaurant(restaurantId);
    return res.json(menus);
  } catch (err) { next(err); }
}

async function listMenuItems(req, res, next) {
  try {
    const { menuId } = req.params;
    const items = await menuItemModel.findByMenu(menuId);
    return res.json(items);
  } catch (err) { next(err); }
}

module.exports = {createMenuItem, listMenus, listMenuItems };
