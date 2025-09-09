import { json, readBody } from "../util/http.js";
import fs from "node:fs";
import path from "node:path";
import { hashPassword, verifyPassword } from "../util/hash.js";
import {
  createUser,
  getUserByUsername,
  updateAvatar,
  updateVibe,
} from "../models/users.js";
import { createSession, deleteSession } from "../models/sessions.js";
import { currentUser } from "../util/auth-mw.js";

export async function authRouter(req, res, url) {
  // Helpers for avatar upload via data URL
  function isImageDataUrl(s) {
    return (
      typeof s === "string" &&
      /^data:(image\/(png|jpe?g|webp));base64,/i.test(s.trim())
    );
  }

  function ensureUploadDir() {
    const dir = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../uploads/avatars"
    );
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  async function saveAvatarFromDataUrl(userId, dataUrl) {
    try {
      const m = dataUrl.match(/^data:(image\/(png|jpe?g|webp));base64,(.+)$/i);
      if (!m) return null;
      const mime = m[1].toLowerCase();
      const ext =
        mime.endsWith("jpeg") || mime.endsWith("jpg")
          ? "jpg"
          : mime.endsWith("png")
          ? "png"
          : "webp";
      const base64 = m[3];
      const buf = Buffer.from(base64, "base64");
      // rudimentary size guard (<= 2MB)
      if (buf.length > 2 * 1024 * 1024) return null;
      const dir = ensureUploadDir();
      const filename = `${userId}_${Date.now()}.${ext}`;
      const filePath = path.join(dir, filename);
      await fs.promises.writeFile(filePath, buf);
      // public URL path (served from /uploads)
      return `/uploads/avatars/${filename}`;
    } catch {
      return null;
    }
  }

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
    if (avatar && isImageDataUrl(avatar)) {
      const stored = await saveAvatarFromDataUrl(u.id, avatar);
      if (stored) await updateAvatar(u.id, stored);
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
    json(res, 200, {
      id: user.id,
      username: user.username,
      role: user.role,
      avatar: user.avatar || null,
      vibe: user.vibe || null,
    });
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
    if (!isImageDataUrl(avatar)) {
      json(res, 400, { error: "invalid avatar" });
      return true;
    }
    const stored = await saveAvatarFromDataUrl(user.id, avatar);
    if (!stored) {
      json(res, 400, { error: "invalid avatar" });
      return true;
    }
    const updated = await updateAvatar(user.id, stored);
    json(res, 200, {
      id: updated.id,
      username: updated.username,
      avatar: updated.avatar || null,
    });
    return true;
  }

  // Update vibe (emoji)
  if (req.method === "POST" && url.pathname === "/settings/vibe") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "not authed" });
      return true;
    }
    const body = await readBody(req).catch(() => ({}));
    const vibe = typeof body?.vibe === "string" ? body.vibe : null;
    const updated = await updateVibe(user.id, vibe);
    json(res, 200, {
      id: updated.id,
      username: updated.username,
      avatar: updated.avatar || null,
      vibe: updated.vibe || null,
    });
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
