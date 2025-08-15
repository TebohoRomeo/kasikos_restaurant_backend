const menuModel = require('../models/menuModel');
const menuItemModel = require('../models/menuItemModel');
const storageService = require('../services/storageService');

/**
 * POST /api/menus
 * auth + requireRestaurantOwner
 * body: title, description
 */
async function createMenu(req, res, next) {
  try {
    const restaurantId = req.user.restaurant_id;
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const menu = await menuModel.createMenu(restaurantId, title, description);
    return res.status(201).json(menu);
  } catch (err) { next(err); }
}

/**
 * POST /api/menus/:menuId/items
 * auth + requireRestaurantOwner
 * single file: image
 */
async function createMenuItem(req, res, next) {
  try {
    const restaurantId = req.user.restaurant_id;
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

module.exports = { createMenu, createMenuItem, listMenus, listMenuItems };
