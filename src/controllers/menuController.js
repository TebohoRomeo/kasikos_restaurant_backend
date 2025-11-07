const menuItemModel = require("../models/menuItemModel");
const storageService = require("../services/storageService");

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

    if (!name || !price)
      return res.status(400).json({ error: "name and price required" });

    // handle file -> storage
    const file = req.file;
    const uploaded = await storageService.upload(file);

    const item = await menuItemModel.createMenuItem({
      menuId,
      name,
      description,
      price,
      currency,
      imageUrl: uploaded ? uploaded.url : null,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function listMenus(req, res, next) {
  try {
    const restaurantId = req.params.restaurantId || req.user.restaurant_id;
    const menus = await menuModel.findByRestaurant(restaurantId);
    return res.json(menus);
  } catch (err) {
    next(err);
  }
}

async function listMenuItems(req, res, next) {
  // List all menu items of a restaurant
  try {
    const { menuItemId } = req.params;
    const items = await menuItemModel.findByMenu(menuItemId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

async function editMenuItem(req, res, next) {
  // Must be able to edit menu item
  try {
    const { menuItemId } = req.params;
    const items = await menuItemModel.findByMenu(menuItemId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

async function deleteMenuItem(req, res, next) {
  // Must be able to delete menu item
  try {
    const { menuItemId } = req.params;
    const items = await menuItemModel.findByMenu(menuItemId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

async function disableMenuItem(req, res, next) {
  // 'disable item to show availability
  try {
    const { menuId } = req.params;
    const items = await menuItemModel.findByMenu(menuId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMenuItem,
  listMenus,
  listMenuItems,
  editMenuItem,
  deleteMenuItem,
  disableMenuItem,
};
