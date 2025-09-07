import { json, readBody } from "../util/http.js";
import { hashPassword, verifyPassword } from "../util/hash.js";
import { createUser, getUserByUsername, updateAvatar } from "../models/users.js";
import { createSession, deleteSession } from "../models/sessions.js";
import { currentUser } from "../util/auth-mw.js";

export async function authRouter(req, res, url) {
  if (req.method === "POST" && url.pathname === "/register") {
    const { username, password, avatar } = await readBody(req);
    if (!username || !password) {
      json(res, 400, { error: "need creds" });
      return true;
    }

    const u = await createUser(username, hashPassword(password));
    if (!u) {
      json(res, 409, { error: "user exists" });
      return true;
    }
    if (avatar && typeof avatar === "string") {
      await updateAvatar(u.id, avatar);
    }
    json(res, 201, { status: "ok" });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/login") {
    const { username, password } = await readBody(req);
    const user = await getUserByUsername(username);
    if (!user || !verifyPassword(user.password_hash, password)) {
      json(res, 401, { error: "bad creds" });
      return true;
    }

    const token = await createSession(user.id);
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`
    );
    json(res, 200, { status: "ok" });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/me") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "not authed" });
      return true;
    }
  json(res, 200, { id: user.id, username: user.username, role: user.role, avatar: user.avatar || null });
    return true;
  }

  // Update avatar
  if (req.method === "POST" && url.pathname === "/settings/avatar") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "not authed" });
      return true;
    }
    const body = await readBody(req).catch(() => ({}));
    const avatar = typeof body?.avatar === "string" ? body.avatar : "";
    const updated = await updateAvatar(user.id, avatar);
    json(res, 200, { id: updated.id, username: updated.username, avatar: updated.avatar || null });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/logout") {
    const cookie = (req.headers.cookie || "")
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.slice(6);
    if (cookie) await deleteSession(cookie);
    res.setHeader(
      "Set-Cookie",
      "token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    );
    json(res, 200, { status: "ok" });
    return true;
  }

  return false;
}
