import pool from "../db/pool.js";

export async function createUser(username, hash) {
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash)
     VALUES ($1,$2)
     ON CONFLICT (username) DO NOTHING
     RETURNING id, username, avatar`,
    [username, hash]
  );
  return rows[0] || null;
}

export async function getUserByUsername(username) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE username=$1`, [
    username,
  ]);
  return rows[0] || null;
}

export async function getUserById(id) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
  return rows[0] || null;
}

export async function updateAvatar(userId, avatar) {
  const { rows } = await pool.query(
    `UPDATE users SET avatar=$2 WHERE id=$1 RETURNING id, username, avatar`,
    [userId, avatar]
  );
  return rows[0] || null;
}

export async function listUsers(limit = 100, offset = 0) {
  const { rows } = await pool.query(
    `SELECT id, username, role, avatar, created_at FROM users ORDER BY id ASC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

export async function updateUserRole(userId, role) {
  const { rows } = await pool.query(
    `UPDATE users SET role=$2 WHERE id=$1 RETURNING id, username, role`,
    [userId, role]
  );
  return rows[0] || null;
}

export async function deleteUser(userId) {
  await pool.query(`DELETE FROM users WHERE id=$1`, [userId]);
  return true;
}

export async function searchUsers(q, limit = 10, offset = 0) {
  const pattern = `%${q}%`;
  const { rows } = await pool.query(
    `SELECT id, username, avatar, created_at FROM users
      WHERE username ILIKE $1
      ORDER BY username ASC
      LIMIT $2 OFFSET $3`,
    [pattern, limit, offset]
  );
  return rows;
}
