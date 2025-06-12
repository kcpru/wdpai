const api = import.meta.env.VITE_API;

if (!import.meta.env.VITE_API)
  throw new Error("VITE_API env not defined – check .env / Docker args");

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

export async function isAuthenticated(): Promise<boolean> {
  if (cached !== null) return cached;
  if (inflight) return inflight;

  inflight = fetch(`${api}/me`, { credentials: "include" })
    .then((r) => (cached = r.ok))
    .catch(() => (cached = false))
    .finally(() => (inflight = null));

  return inflight;
}

export function setAuth(v: boolean) {
  cached = v;
  window.dispatchEvent(new Event("auth-changed"));
}

export function logout() {
  cached = false;
  fetch(`${api}/logout`, { method: "POST", credentials: "include" });
  window.dispatchEvent(new Event("auth-changed"));
}
