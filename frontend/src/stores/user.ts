const api = import.meta.env.VITE_API;

if (!import.meta.env.VITE_API)
  throw new Error("VITE_API env not defined – check .env / Docker args");

// Initialize from last known state to avoid UI flicker when backend is unreachable
const persisted = (() => {
  try {
    return localStorage.getItem("auth");
  } catch {
    return null;
  }
})();

let cached: boolean | null =
  persisted === null ? null : persisted === "1" ? true : false;
let inflight: Promise<boolean> | null = null;

export async function isAuthenticated(): Promise<boolean> {
  if (cached !== null) return cached;
  if (inflight) return inflight;

  inflight = fetch(`${api}/me`, { credentials: "include" })
    .then((r) => (cached = r.ok))
    .catch(() => (cached = cached ?? false))
    .finally(() => (inflight = null));

  return inflight;
}

export function setAuth(v: boolean) {
  cached = v;
  try {
    localStorage.setItem("auth", v ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event("auth-changed"));
}

export function logout() {
  cached = false;
  fetch(`${api}/logout`, { method: "POST", credentials: "include" });
  try {
    localStorage.setItem("auth", "0");
  } catch {}
  window.dispatchEvent(new Event("auth-changed"));
}

// Read current cached auth state (may be null if never checked yet)
export function getAuthCached(): boolean | null {
  return cached;
}
