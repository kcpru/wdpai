import fs from "node:fs";
import { Pool } from "pg";
import { hashPassword } from "./util/hash.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureSchema() {
  const sql = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(sql);
}

async function upsertUser({
  username,
  password,
  role = "user",
  avatar = null,
}) {
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
  const { rows } = await pool.query(`SELECT id FROM users WHERE username=$1`, [
    username,
  ]);
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

  // Always reset DB contents on container start
  await pool.query(
    `TRUNCATE TABLE notifications, comments, post_likes, bookmarks, posts, sessions, users RESTART IDENTITY CASCADE`
  );

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

  // Extra users for richer demo
  const charlie = await upsertUser({
    username: "charlie",
    password: "password123",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=charlie",
  });
  const dana = await upsertUser({
    username: "dana",
    password: "password123",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=dana",
  });
  const eve = await upsertUser({
    username: "eve",
    password: "password123",
    role: "user",
    avatar: "https://i.pravatar.cc/150?u=eve",
  });

  // Posts
  const p1 = await insertPostByUsername(
    "admin",
    "Welcome to the platform! This is an example post from admin.",
    []
  );
  const p2 = await insertPostByUsername(
    "alice",
    "Hello world! Just trying this out. ",
    []
  );
  const p3 = await insertPostByUsername(
    "alice",
    "A beautiful day to write some code.",
    []
  );
  const p4 = await insertPostByUsername(
    "bob",
    "Check out this awesome picture!",
    [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&auto=format&fit=crop",
    ]
  );

  // Y vs X jokes and puns
  const p5 = await insertPostByUsername(
    "charlie",
    "Switched from X to Y, because... Y not?",
    []
  );
  const p6 = await insertPostByUsername(
    "dana",
    "On Y we don’t ask what’s happening, we ask: why is it happening?",
    []
  );
  const p7 = await insertPostByUsername(
    "eve",
    "Is a repost on Y a re-why? I’m still figuring it out.",
    []
  );
  const p8 = await insertPostByUsername(
    "admin",
    "Y is like X’s cousin who always answers questions with another question.",
    []
  );
  const p9 = await insertPostByUsername(
    "alice",
    "I forked my feed from X into a Y-branch. Git it?",
    []
  );
  const p10 = await insertPostByUsername(
    "bob",
    "Posting on Y feels like debugging life: lots of whys, occasional fixes.",
    []
  );

  // Comments (demo)
  async function addComment(postId, username, content) {
    if (!postId) return;
    const uid = await getUserId(username);
    if (!uid) return;
    await pool.query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1,$2,$3)`,
      [postId.id || postId, uid, content]
    );
  }
  await addComment(p2, "admin", "Nice to see you here!");
  await addComment(p2, "bob", "Hello Alice! 🙌");
  await addComment(p4, "alice", "Great photo!");
  await addComment(p5, "dana", "10/10 wordplay 😄");
  await addComment(p6, "charlie", "Because it compiles! ✅");
  await addComment(p7, "admin", "We’ll call it a re-Y.");
  await addComment(p8, "eve", "That’s deep. Or is it shallow? Why not both.");
  await addComment(p9, "bob", "I git it. Nicely branched.");
  await addComment(p10, "alice", "Rubber ducky approved.");

  // Likes (demo) + like notifications for post owners
  async function addLike(postId, username) {
    if (!postId) return;
    const uid = await getUserId(username);
    if (!uid) return;
    const pid = postId.id || postId;
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id)
       VALUES ($1,$2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [pid, uid]
    );
    // Notification to post owner (skip self-like)
    await pool.query(
      `INSERT INTO notifications (user_id, actor_id, type, post_id)
         SELECT p.user_id, $1, 'like', p.id
           FROM posts p
          WHERE p.id = $2 AND p.user_id <> $1
       ON CONFLICT DO NOTHING`,
      [uid, pid]
    );
  }
  await addLike(p1, "alice");
  await addLike(p1, "bob");
  await addLike(p2, "bob");
  await addLike(p4, "admin");
  await addLike(p5, "admin");
  await addLike(p5, "alice");
  await addLike(p6, "charlie");
  await addLike(p6, "bob");
  await addLike(p7, "dana");
  await addLike(p8, "eve");
  await addLike(p9, "admin");
  await addLike(p9, "eve");
  await addLike(p10, "charlie");

  // Bookmarks (demo)
  async function addBookmark(postId, username) {
    if (!postId) return;
    const uid = await getUserId(username);
    if (!uid) return;
    const pid = postId.id || postId;
    await pool.query(
      `INSERT INTO bookmarks (user_id, post_id)
       VALUES ($1,$2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [uid, pid]
    );
  }
  await addBookmark(p1, "alice");
  await addBookmark(p4, "alice");
  await addBookmark(p2, "bob");
  await addBookmark(p5, "dana");
  await addBookmark(p6, "eve");
  await addBookmark(p9, "charlie");

  console.log(
    "✓ seed applied (reset): users, posts, comments, likes, bookmarks, and notifications"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
