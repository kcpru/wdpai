import { createServer } from "node:http";
import { authRouter } from "./routes/auth.js";
import { json } from "./util/http.js";

const PORT = process.env.PORT || 8000;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (await authRouter(req, res, url)) return;

  json(res, 404, { error: "not found" });
}).listen(PORT, () => console.log("API listening on http://localhost:" + PORT));
