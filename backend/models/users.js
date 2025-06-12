import pool from "../db/pool.js";

export async function createUser(username, hash) {
  const {
    rows: [u],
  } = await pool.query(
    `INSERT INTO users (username, password_hash)
     VALUES ($1,$2)
     RETURNING id, username`,
    [username, hash]
  );
  return u;
}

export async function getUserByUsername(username) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE username=$1`, [
    username,
  ]);
  return rows[0] || null;
}
