const { pool } = require('../config/db');

async function createUser({ firstname, lastname, email, phones, passwordHash }, client = null) {
  const q = `
    INSERT INTO user (firstname, lastname, email, phones, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, firstname, lastname, email, phones, created_at
  `;
  const params = [firstname, lastname, email, phones, passwordHash];
  const executor = client ? client.query.bind(client) : pool.query.bind(pool);
  const result = await executor(q, params);
  return result.rows[0];
}

async function findByEmail(email) {
  const res = await pool.query('SELECT * FROM user WHERE email = $1', [email]);
  return res.rows[0];
}

async function findById(id) {
  const res = await pool.query(
    'SELECT id, firstname, lastname, email, phones, created_at FROM user WHERE id = $1',
    [id]
  );
  return res.rows[0];
}

module.exports = { createUser, findByEmail, findById };
