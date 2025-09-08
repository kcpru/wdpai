import pool from "../db/pool.js";

export async function createPost(
  userId,
  content,
  images = [],
  vibe = null,
  location = null
) {
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, content, images, vibe, location)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, user_id, content, images, vibe, location, created_at`,
    [userId, content, images, vibe, location]
  );
  return rows[0];
}

export async function listPosts(limit = 50, offset = 0, viewerId = null) {
  const { rows } = await pool.query(
    `SELECT p.id, p.content, p.images, p.vibe, p.location, p.created_at,
      u.id as user_id, u.username, u.avatar,
            COALESCE(pl.cnt, 0) AS likes_count,
            COALESCE(bm.cnt, 0) AS bookmarks_count,
            COALESCE(cm.cnt, 0) AS comments_count,
            (CASE WHEN $3::int IS NULL THEN false ELSE EXISTS (
               SELECT 1 FROM post_likes x WHERE x.post_id = p.id AND x.user_id = $3
             ) END) AS liked,
            (CASE WHEN $3::int IS NULL THEN false ELSE EXISTS (
               SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $3
             ) END) AS bookmarked
       FROM posts p
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
      LIMIT $1 OFFSET $2`,
    [limit, offset, viewerId]
  );
  return rows;
}

export async function listPostsByUser(
  userId,
  limit = 50,
  offset = 0,
  viewerId = null
) {
  const { rows } = await pool.query(
    `SELECT p.id, p.content, p.images, p.vibe, p.location, p.created_at,
      u.id as user_id, u.username, u.avatar,
            COALESCE(pl.cnt, 0) AS likes_count,
            COALESCE(bm.cnt, 0) AS bookmarks_count,
            COALESCE(cm.cnt, 0) AS comments_count,
            (CASE WHEN $4::int IS NULL THEN false ELSE EXISTS (
               SELECT 1 FROM post_likes x WHERE x.post_id = p.id AND x.user_id = $4
             ) END) AS liked,
            (CASE WHEN $4::int IS NULL THEN false ELSE EXISTS (
               SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $4
             ) END) AS bookmarked
       FROM posts p
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
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset, viewerId]
  );
  return rows;
}

export async function deletePost(postId, userId, role = "user") {
  // Admins and moderators can delete any post; regular users can delete their own
  if (role === "admin" || role === "moderator") {
    const { rowCount } = await pool.query(`DELETE FROM posts WHERE id=$1`, [
      postId,
    ]);
    return rowCount > 0;
  }
  const { rowCount } = await pool.query(
    `DELETE FROM posts WHERE id=$1 AND user_id=$2`,
    [postId, userId]
  );
  return rowCount > 0;
}

export async function toggleLike(postId, userId, wantLike) {
  // find post owner for notifications
  const ownerRes = await pool.query(`SELECT user_id FROM posts WHERE id=$1`, [
    postId,
  ]);
  const owner_id = ownerRes.rows[0]?.user_id || null;

  if (wantLike) {
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId]
    );
  } else {
    await pool.query(`DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2`, [
      postId,
      userId,
    ]);
  }
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS likes_count FROM post_likes WHERE post_id=$1`,
    [postId]
  );
  return { likes_count: rows[0]?.likes_count ?? 0, owner_id };
}

export async function toggleBookmark(postId, userId, want) {
  if (want) {
    await pool.query(
      `INSERT INTO bookmarks (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [postId, userId]
    );
  } else {
    await pool.query(`DELETE FROM bookmarks WHERE post_id=$1 AND user_id=$2`, [
      postId,
      userId,
    ]);
  }
  return { ok: true };
}

export async function listBookmarkedBy(userId, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    `SELECT p.id, p.content, p.images, p.vibe, p.location, p.created_at,
      u.id as user_id, u.username, u.avatar,
            COALESCE(pl.cnt, 0) AS likes_count,
            COALESCE(bm.cnt, 0) AS bookmarks_count,
            COALESCE(cm.cnt, 0) AS comments_count,
            true AS bookmarked,
            EXISTS (SELECT 1 FROM post_likes x WHERE x.post_id = p.id AND x.user_id = $1) AS liked
       FROM bookmarks b
       JOIN posts p ON p.id = b.post_id
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
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}

export async function searchPosts(q, limit = 20, offset = 0, viewerId = null) {
  const pattern = `%${q}%`;
  const { rows } = await pool.query(
    `SELECT p.id, p.content, p.images, p.vibe, p.created_at,
            u.id as user_id, u.username, u.avatar,
            COALESCE(pl.cnt, 0) AS likes_count,
            COALESCE(bm.cnt, 0) AS bookmarks_count,
            COALESCE(cm.cnt, 0) AS comments_count,
            (CASE WHEN $4::int IS NULL THEN false ELSE EXISTS (
               SELECT 1 FROM post_likes x WHERE x.post_id = p.id AND x.user_id = $4
             ) END) AS liked,
            (CASE WHEN $4::int IS NULL THEN false ELSE EXISTS (
               SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $4
             ) END) AS bookmarked
       FROM posts p
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
      WHERE p.content ILIKE $1 OR u.username ILIKE $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [pattern, limit, offset, viewerId]
  );
  return rows;
}

export async function listComments(postId, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    `SELECT c.id, c.post_id, c.content, c.created_at,
            u.id AS user_id, u.username, u.avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );
  return rows;
}

export async function createComment(postId, userId, content) {
  const clean = String(content || "").slice(0, 1000);
  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, user_id, content)
     VALUES ($1,$2,$3)
     RETURNING id, post_id, content, created_at`,
    [postId, userId, clean]
  );
  const base = rows[0];
  // enrich with author
  const { rows: u } = await pool.query(
    `SELECT id AS user_id, username, avatar FROM users WHERE id=$1`,
    [userId]
  );
  return { ...base, ...u[0] };
}
