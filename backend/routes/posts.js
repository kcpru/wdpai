import { json, readBody } from "../util/http.js";
import { currentUser } from "../util/auth-mw.js";
import { createPost, listPosts, deletePost, toggleLike, toggleBookmark, listBookmarkedBy, searchPosts } from "../models/posts.js";
import { searchUsers } from "../models/users.js";

export async function postsRouter(req, res, url) {
  if (url.pathname === "/posts" && req.method === "GET") {
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const user = await currentUser(req).catch(() => null);
    const posts = await listPosts(limit, offset, user?.id ?? null);
    json(res, 200, { posts });
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
    const ok = await deletePost(id, user.id);
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
    const posts = q ? await searchPosts(q, limit, offset, user?.id ?? null) : [];
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
    json(res, 200, { liked: like, ...data });
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

  return false;
}
