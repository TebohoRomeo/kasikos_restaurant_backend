import { pool } from '../config/db.js';

// export async function createMenuItem({ restaurantId, title, description, price, currency='USD', active=true }){
//   const q = `INSERT INTO menu_items (restaurant_id, title, description, price, currency, active)
//              VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
//   const res = await pool.query(q, [restaurantId, title, description || null, price, currency, active]);
//   return res.rows[0];
// }

export async function createMenuItem({ menuId, name, description, price, prepTime, allergens, imageUrl, active=true }, client = null) {
  const q = `INSERT INTO menu_items (menu_id, name, description, price, pret_time, allergens, image_url, active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
  const executor = client ? client.query.bind(client) : pool.query.bind(pool);
  const res = await executor(q, [menuId, name, description, price || 'ZAR', prepTime, allergens, imageUrl || null, active]);
  return res.rows[0];
}

export async function updateMenuItem({ id, restaurantId, title, description, price, currency='USD', active=true }){
  const q = `UPDATE menu_items SET title=$1, description=$2, price=$3, currency=$4, active=$5, updated_at=NOW()
             WHERE id=$6 AND restaurant_id=$7 RETURNING *`;
  const res = await pool.query(q, [title, description || null, price, currency, active, id, restaurantId]);
  return res.rows[0];
}

export async function deleteMenuItem(id, restaurantId){
  const q = `DELETE FROM menu_items WHERE id=$1 AND restaurant_id=$2 RETURNING id`;
  const res = await pool.query(q, [id, restaurantId]);
  return res.rows[0];
}

export async function getMenuForRestaurant(restaurantId){
  const res = await pool.query('SELECT * FROM menu_items WHERE restaurant_id=$1 ORDER BY created_at ASC', [restaurantId]);
  return res.rows;
}

export async function getMenuItemById(id){
  const res = await pool.query('SELECT * FROM menu_items WHERE id=$1', [id]);
  return res.rows[0];
}
