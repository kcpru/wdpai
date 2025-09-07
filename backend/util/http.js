export const json = (res, code, obj) => {
  // 204/304 must not include a message body
  if (code === 204 || code === 304) {
    res.writeHead(code);
    res.end();
    return;
  }
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj ?? {}));
};

export const readBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        resolve({});
      }
    });
  });
