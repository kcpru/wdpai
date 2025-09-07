import pool from "../db/pool.js";
import { randomBytes } from "node:crypto";

export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  await pool.query(`INSERT INTO sessions (token, user_id) VALUES ($1,$2)`, [
    token,
    userId,
  ]);
  return token;
}

export async function getUserByToken(token) {
  const { rows } = await pool.query(
    `SELECT u.* FROM users u
     JOIN sessions s ON s.user_id=u.id
     WHERE s.token=$1
       AND s.expires>NOW()`,
    [token]
  );
  return rows[0] || null;
}

export async function deleteSession(token) {
  await pool.query(`DELETE FROM sessions WHERE token=$1`, [token]);
}
