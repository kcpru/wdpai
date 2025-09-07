import { json } from "../util/http.js";
import { currentUser } from "../util/auth-mw.js";
import { listNotifications, markAllRead } from "../models/notifications.js";

export async function notificationsRouter(req, res, url) {
  if (url.pathname === "/notifications" && req.method === "GET") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const items = await listNotifications(user.id, limit, offset);
    json(res, 200, { notifications: items });
    return true;
  }
  if (url.pathname === "/notifications/read" && req.method === "POST") {
    const user = await currentUser(req);
    if (!user) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    await markAllRead(user.id);
    json(res, 204, {});
    return true;
  }
  return false;
}
