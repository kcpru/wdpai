import { json, readBody } from "../util/http.js";
import { currentUser } from "../util/auth-mw.js";
import { deleteUser, listUsers, updateUserRole } from "../models/users.js";

function requireAdmin(user) {
  return user && user.role === "admin";
}

export async function adminRouter(req, res, url) {
  if (!url.pathname.startsWith("/admin")) return false;
  const user = await currentUser(req);
  if (!user) {
    json(res, 401, { error: "unauthorized" });
    return true;
  }
  if (!requireAdmin(user)) {
    json(res, 403, { error: "forbidden" });
    return true;
  }

  // GET /admin/users
  if (req.method === "GET" && url.pathname === "/admin/users") {
    const limit = Number(url.searchParams.get("limit") || 100);
    const offset = Number(url.searchParams.get("offset") || 0);
    const users = await listUsers(limit, offset);
    json(res, 200, { users });
    return true;
  }

  // POST /admin/users/:id/role { role }
  if (
    req.method === "POST" &&
    /^\/admin\/users\/\d+\/role$/.test(url.pathname)
  ) {
    const targetId = Number(url.pathname.split("/")[3]);
    const { role } = await readBody(req);
    if (!role || !["user", "admin", "moderator"].includes(role)) {
      json(res, 400, { error: "bad_role" });
      return true;
    }
    const updated = await updateUserRole(targetId, role);
    json(res, 200, { user: updated });
    return true;
  }

  // DELETE /admin/users/:id
  if (req.method === "DELETE" && /^\/admin\/users\/\d+$/.test(url.pathname)) {
    const targetId = Number(url.pathname.split("/")[3]);
    await deleteUser(targetId);
    json(res, 204, {});
    return true;
  }

  return false;
}
