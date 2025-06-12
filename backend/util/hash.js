import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITER = 310_000;
const LEN = 32;
const SALT = 16;

export function hashPassword(pw) {
  const salt = randomBytes(SALT);
  const hash = pbkdf2Sync(pw, salt, ITER, LEN, "sha256");
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(stored, pw) {
  const [saltHex, hashHex] = stored.split(":");
  const derived = pbkdf2Sync(
    pw,
    Buffer.from(saltHex, "hex"),
    ITER,
    LEN,
    "sha256"
  );
  return timingSafeEqual(Buffer.from(hashHex, "hex"), derived);
}
