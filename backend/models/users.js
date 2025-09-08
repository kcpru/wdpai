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
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE lower(username)=lower($1)`,
    [username]
  );
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

export async function updateVibe(userId, vibe) {
  const { rows } = await pool.query(
    `UPDATE users SET vibe=$2 WHERE id=$1 RETURNING id, username, avatar, vibe`,
    [userId, vibe]
  );
  return rows[0] || null;
}

export async function listUsers(limit = 100, offset = 0) {
  const { rows } = await pool.query(
    `SELECT id, username, role, avatar, vibe, created_at FROM users ORDER BY id ASC LIMIT $1 OFFSET $2`,
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

export async function isFollowing(followerId, followeeId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM follows WHERE follower_id=$1 AND followee_id=$2`,
    [followerId, followeeId]
  );
  return rows.length > 0;
}

export async function toggleFollow(followerId, followeeId, want) {
  if (followerId === followeeId) return { ok: false, following: false };
  if (want) {
    await pool.query(
      `INSERT INTO follows (follower_id, followee_id)
       VALUES ($1,$2)
       ON CONFLICT (follower_id, followee_id) DO NOTHING`,
      [followerId, followeeId]
    );
  } else {
    await pool.query(
      `DELETE FROM follows WHERE follower_id=$1 AND followee_id=$2`,
      [followerId, followeeId]
    );
  }
  return { ok: true, following: want };
}

export async function listFeedForUser(userId, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    `SELECT p.id, p.content, p.images, p.vibe, p.created_at,
            u.id as user_id, u.username, u.avatar,
            COALESCE(pl.cnt, 0) AS likes_count,
            COALESCE(bm.cnt, 0) AS bookmarks_count,
            COALESCE(cm.cnt, 0) AS comments_count,
            EXISTS (SELECT 1 FROM post_likes x WHERE x.post_id = p.id AND x.user_id = $1) AS liked,
            EXISTS (SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $1) AS bookmarked
       FROM posts p
       JOIN follows f ON f.followee_id = p.user_id AND f.follower_id = $1
       JOIN users u ON u.id = p.user_id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS cnt FROM post_likes GROUP BY post_id
       ) pl ON pl.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS cnt FROM bookmarks GROUP BY post_id
       ) bm ON bm.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id
       ) cm ON cm.post_id = p.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}

export async function countFollowers(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM follows WHERE followee_id=$1`,
    [userId]
  );
  return rows[0]?.c ?? 0;
}

export async function countFollowing(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM follows WHERE follower_id=$1`,
    [userId]
  );
  return rows[0]?.c ?? 0;
}
