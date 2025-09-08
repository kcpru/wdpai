import { json, readBody } from "../util/http.js";
import { currentUser } from "../util/auth-mw.js";
import {
  createPost,
  listPosts,
  deletePost,
  toggleLike,
  toggleBookmark,
  listBookmarkedBy,
  searchPosts,
  listPostsByUser,
  listComments,
  createComment,
} from "../models/posts.js";
import {
  createLikeNotification,
  removeLikeNotification,
} from "../models/notifications.js";
import {
  searchUsers,
  getUserByUsername,
  listFeedForUser,
  toggleFollow,
  isFollowing,
  countFollowers,
  countFollowing,
} from "../models/users.js";
import {
  createFollowNotification,
  removeFollowNotification,
} from "../models/notifications.js";

export async function postsRouter(req, res, url) {
  if (url.pathname === "/posts" && req.method === "GET") {
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const user = await currentUser(req).catch(() => null);
    const posts = await listPosts(limit, offset, user?.id ?? null);
    json(res, 200, { posts });
    return true;
  }

  // GET /feed - posts from users I follow
  if (url.pathname === "/feed" && req.method === "GET") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const posts = await listFeedForUser(user.id, limit, offset);
    json(res, 200, { posts });
    return true;
  }

  // GET /posts/:id/comments
  if (req.method === "GET" && /^\/posts\/\d+\/comments$/.test(url.pathname)) {
    const id = Number(url.pathname.split("/")[2] || 0);
    if (!Number.isInteger(id) || id <= 0) {
      json(res, 400, { error: "invalid_id" });
      return true;
    }
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const comments = await listComments(id, limit, offset);
    json(res, 200, { comments });
    return true;
  }

  // POST /posts/:id/comments { content }
  if (req.method === "POST" && /^\/posts\/\d+\/comments$/.test(url.pathname)) {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const id = Number(url.pathname.split("/")[2] || 0);
    if (!Number.isInteger(id) || id <= 0) {
      json(res, 400, { error: "invalid_id" });
      return true;
    }
    const body = await readBody(req).catch(() => null);
    const content = String(body?.content || "").trim();
    if (!content) {
      json(res, 400, { error: "empty_content" });
      return true;
    }
    const comment = await createComment(id, user.id, content);
    json(res, 201, { comment });
    return true;
  }

  // GET /bookmarks - list current user's bookmarks
  if (url.pathname === "/bookmarks" && req.method === "GET") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const posts = await listBookmarkedBy(user.id, limit, offset);
    json(res, 200, { posts });
    return true;
  }

  if (url.pathname === "/posts" && req.method === "POST") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const body = await readBody(req).catch(() => null);
    if (!body || typeof body.content !== "string") {
      json(res, 400, { error: "invalid_body" });
      return true;
    }
    const images = Array.isArray(body.images) ? body.images : [];
    const post = await createPost(user.id, body.content.slice(0, 1000), images);
    json(res, 201, { post });
    return true;
  }

  // DELETE /posts/:id
  if (req.method === "DELETE" && url.pathname.startsWith("/posts/")) {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const idStr = url.pathname.split("/")[2] || "";
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      json(res, 400, { error: "invalid_id" });
      return true;
    }
    const ok = await deletePost(id, user.id, user.role || "user");
    if (!ok) {
      json(res, 403, { error: "forbidden_or_not_found" });
      return true;
    }
    json(res, 204, {});
    return true;
  }

  // GET /search/users?q=term
  if (req.method === "GET" && url.pathname === "/search/users") {
    const q = url.searchParams.get("q") || "";
    const users = q ? await searchUsers(q, 10, 0) : [];
    json(res, 200, { users });
    return true;
  }

  // GET /search/posts?q=term
  if (req.method === "GET" && url.pathname === "/search/posts") {
    const q = url.searchParams.get("q") || "";
    const limit = Number(url.searchParams.get("limit") || 20);
    const offset = Number(url.searchParams.get("offset") || 0);
    const user = await currentUser(req).catch(() => null);
    const posts = q
      ? await searchPosts(q, limit, offset, user?.id ?? null)
      : [];
    json(res, 200, { posts });
    return true;
  }

  // POST /posts/:id/like { like: boolean }
  if (req.method === "POST" && /^\/posts\/\d+\/like$/.test(url.pathname)) {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const id = Number(url.pathname.split("/")[2] || 0);
    const body = await readBody(req).catch(() => ({}));
    const like = Boolean(body?.like);
    const data = await toggleLike(id, user.id, like);
    // create/remove notification for the post owner
    if (data.owner_id && data.owner_id !== user.id) {
      if (like) {
        await createLikeNotification({
          recipientId: data.owner_id,
          actorId: user.id,
          postId: id,
        });
      } else {
        await removeLikeNotification({
          recipientId: data.owner_id,
          actorId: user.id,
          postId: id,
        });
      }
    }
    json(res, 200, { liked: like, likes_count: data.likes_count });
    return true;
  }

  // POST /posts/:id/bookmark { bookmark: boolean }
  if (req.method === "POST" && /^\/posts\/\d+\/bookmark$/.test(url.pathname)) {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const id = Number(url.pathname.split("/")[2] || 0);
    const body = await readBody(req).catch(() => ({}));
    const bookmark = Boolean(body?.bookmark);
    await toggleBookmark(id, user.id, bookmark);
    json(res, 200, { bookmarked: bookmark });
    return true;
  }

  // GET /users/:username – public profile
  if (req.method === "GET" && /^\/users\/.+/.test(url.pathname)) {
    const username = decodeURIComponent(url.pathname.split("/")[2] || "");
    if (!username) return false;
    const user = await getUserByUsername(username);
    if (!user) {
      json(res, 404, { error: "not_found" });
      return true;
    }
    // If path ends with /posts, return posts, else profile
    if (url.pathname.endsWith("/posts")) {
      const limit = Number(url.searchParams.get("limit") || 50);
      const offset = Number(url.searchParams.get("offset") || 0);
      const viewer = await currentUser(req).catch(() => null);
      const posts = await listPostsByUser(
        user.id,
        limit,
        offset,
        viewer?.id ?? null
      );
      json(res, 200, { posts });
      return true;
    }
    const viewer = await currentUser(req).catch(() => null);
    const following = viewer?.id
      ? await isFollowing(viewer.id, user.id)
      : false;
    const [followers_count, following_count] = await Promise.all([
      countFollowers(user.id),
      countFollowing(user.id),
    ]);
    json(res, 200, {
      id: user.id,
      username: user.username,
      avatar: user.avatar || null,
      role: user.role,
      created_at: user.created_at,
      following,
      followers_count,
      following_count,
    });
    return true;
  }

  // POST /users/:username/follow { follow: boolean }
  if (req.method === "POST" && /^\/users\/.+\/follow$/.test(url.pathname)) {
    const me = await currentUser(req);
    if (!me) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const username = decodeURIComponent(url.pathname.split("/")[2] || "");
    const target = await getUserByUsername(username);
    if (!target) {
      json(res, 404, { error: "not_found" });
      return true;
    }
    const body = await readBody(req).catch(() => ({}));
    const want = Boolean(body?.follow);
    await toggleFollow(me.id, target.id, want);
    if (want)
      await createFollowNotification({
        recipientId: target.id,
        actorId: me.id,
      });
    else
      await removeFollowNotification({
        recipientId: target.id,
        actorId: me.id,
      });
    json(res, 200, { following: want });
    return true;
  }

  return false;
}
