import fs from "node:fs";
import { Pool } from "pg";
import { hashPassword } from "./util/hash.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureSchema() {
  const sql = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(sql);
}

async function upsertUser({ username, password, role = "user", avatar = null }) {
  const password_hash = hashPassword(password);
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, role, avatar)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (username)
  DO UPDATE SET role=EXCLUDED.role, avatar=EXCLUDED.avatar
     RETURNING id, username, role`,
    [username, password_hash, role, avatar]
  );
  return rows[0];
}

async function getUserId(username) {
  const { rows } = await pool.query(`SELECT id FROM users WHERE username=$1`, [username]);
  return rows[0]?.id || null;
}

async function insertPostByUsername(username, content, images = []) {
  const uid = await getUserId(username);
  if (!uid) return null;
  // idempotent seed: skip if same content by same user exists
  const { rows: exists } = await pool.query(
    `SELECT 1 FROM posts WHERE user_id=$1 AND content=$2 LIMIT 1`,
    [uid, content]
  );
  if (exists.length) return null;
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, content, images)
     VALUES ($1,$2,$3)
     RETURNING id`,
    [uid, content, images]
  );
  return rows[0];
}

async function main() {
  await ensureSchema();

  // Always ensure we have at least one admin account.
  const { rows: admins } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM users WHERE role='admin'`
  );
  const adminCount = admins[0]?.n ?? 0;
  if (adminCount === 0) {
    await upsertUser({
      username: "admin",
      password: "admin123",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?u=admin",
    });
    console.log("✓ ensured admin account (admin)");
  }

  // Seed only when DB is empty (no users yet)
  const { rows: cntRows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM users`
  );
  const userCount = cntRows[0]?.n ?? 0;
  if (userCount > 0) {
    console.log(`↷ seed skipped (users count = ${userCount})`);
    return;
  }

  // Users
  const admin = await upsertUser({
    username: "admin",
    password: "admin123",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?u=admin",
  });
  const alice = await upsertUser({
    username: "alice",
    password: "password123",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=alice",
  });
  const bob = await upsertUser({
    username: "bob",
    password: "password123",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=bob",
  });

  // Posts
  await insertPostByUsername(
    "admin",
    "Welcome to the platform! This is an example post from admin.",
    []
  );
  await insertPostByUsername(
    "alice",
    "Hello world! Just trying this out. ",
    []
  );
  await insertPostByUsername(
    "alice",
    "A beautiful day to write some code.",
    []
  );
  await insertPostByUsername(
    "bob",
    "Check out this awesome picture!",
    [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&auto=format&fit=crop",
    ]
  );

  console.log("✓ seed applied: users (admin, alice, bob) and sample posts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
