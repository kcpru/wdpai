import { getUserByToken } from "../models/sessions.js";

export async function currentUser(req) {
  const cookie = (req.headers.cookie || "")
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.slice(6);
  if (!cookie) return null;
  return await getUserByToken(cookie);
}
