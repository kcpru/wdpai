import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { postsRouter } from "./routes/posts.js";
import { notificationsRouter } from "./routes/notifications.js";
import { json } from "./util/http.js";

const PORT = process.env.PORT || 8000;

createServer(async (req, res) => {
  // CORS (dev-friendly): reflect Origin and allow credentials
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  const reqHdr = req.headers["access-control-request-headers"];
  const reqMethod = req.headers["access-control-request-method"];
  res.setHeader(
    "Access-Control-Allow-Headers",
    typeof reqHdr === "string" && reqHdr.length
      ? reqHdr
      : "Content-Type, X-Requested-With"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    typeof reqMethod === "string" && reqMethod.length
      ? reqMethod
      : "GET,POST,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Max-Age", "600");

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Content-Length": "0" });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Serve uploaded avatars
  if (url.pathname.startsWith("/uploads/")) {
    const filePath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "." + url.pathname
    );
    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) throw new Error("not file");
      const ext = path.extname(filePath).toLowerCase();
      const type =
        ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
          ? "image/webp"
          : "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      fs.createReadStream(filePath).pipe(res);
    } catch {
      json(res, 404, { error: "not found" });
    }
    return;
  }

  if (await authRouter(req, res, url)) return;
  if (await adminRouter(req, res, url)) return;
  if (await postsRouter(req, res, url)) return;
  if (await notificationsRouter(req, res, url)) return;

  json(res, 404, { error: "not found" });
}).listen(PORT, () => console.log("API listening on http://localhost:" + PORT));
