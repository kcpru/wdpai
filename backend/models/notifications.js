import pool from "../db/pool.js";

export async function createLikeNotification({ recipientId, actorId, postId }) {
  if (!recipientId || !actorId || !postId || recipientId === actorId) return;
  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, type, post_id)
     VALUES ($1, $2, 'like', $3)
     ON CONFLICT DO NOTHING`,
    [recipientId, actorId, postId]
  );
}

export async function removeLikeNotification({ recipientId, actorId, postId }) {
  if (!recipientId || !actorId || !postId) return;
  await pool.query(
    `DELETE FROM notifications
      WHERE user_id=$1 AND actor_id=$2 AND type='like' AND post_id=$3`,
    [recipientId, actorId, postId]
  );
}

export async function createFollowNotification({ recipientId, actorId }) {
  if (!recipientId || !actorId || recipientId === actorId) return;
  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, type)
     VALUES ($1, $2, 'follow')
     ON CONFLICT DO NOTHING`,
    [recipientId, actorId]
  );
}

export async function removeFollowNotification({ recipientId, actorId }) {
  if (!recipientId || !actorId) return;
  await pool.query(
    `DELETE FROM notifications WHERE user_id=$1 AND actor_id=$2 AND type='follow'`,
    [recipientId, actorId]
  );
}

export async function listNotifications(userId, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    `SELECT n.id, n.type, n.post_id, n.created_at, n.read,
            a.id AS actor_id, a.username AS actor_username, a.avatar AS actor_avatar,
            p.content AS post_content
       FROM notifications n
       JOIN users a ON a.id = n.actor_id
       LEFT JOIN posts p ON p.id = n.post_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}

export async function markAllRead(userId) {
  await pool.query(`UPDATE notifications SET read = true WHERE user_id=$1`, [
    userId,
  ]);
  return { ok: true };
}
