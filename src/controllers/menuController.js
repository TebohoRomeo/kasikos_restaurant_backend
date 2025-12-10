import { createMenuItem as _createMenuItem, findByMenu } from "../models/menuItemModel.js";
import { upload } from "../services/storageService.js";

/**
 * POST /api/menus/:menuId/items
 * auth + requireRestaurantOwner
 * single file: image
 */

export async function createMenuItem(req, res, next) {
  try {
    const restaurantId = req.user.restaurant_id || req.user.restaurant_id;
    const { menuId } = req.params;
    const { category, name, description, price} = req.body;

    if (!name || !price)
      return res.status(400).json({ error: "name and price required" });

    // handle file -> storage
    const file = req.file;
    const uploaded = await upload(file);

    const item = await _createMenuItem({
      menuId,
      category,
      name,
      description,
      price,
      imageUrl: uploaded ? uploaded.url : null,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function listMenus(req, res, next) {
  // List all menu items of a restaurant
  try {
    const restaurantId = req.params.restaurantId || req.user.restaurant_id;
    const menus = await menuModel.findByRestaurant(restaurantId);
    return res.json(menus);
  } catch (err) {
    next(err);
  }
}

export async function editMenuItem(req, res, next) {
  // Must be able to edit menu item
  try {
    const { menuItemId } = req.params;
    const items = await findByMenu(menuItemId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

 export async function deleteMenuItem(req, res, next) {
  // Must be able to delete menu item
  try {
    const { menuItemId } = req.params;
    const items = await findByMenu(menuItemId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function disableMenuItem(req, res, next) {
  // 'disable item to show availability
  try {
    const { menuId } = req.params;
    const items = await findByMenu(menuId);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}
