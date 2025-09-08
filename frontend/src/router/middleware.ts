import { authGuard } from "./guards";

type Middleware = (ctx: {
  path: string;
  params: Record<string, string>;
}) => Promise<{ allow: boolean; redirect?: string }>;

export const middlewares: Middleware[] = [
  // Default sub-route for settings: redirect /settings -> /settings/account
  async ({ path }) => {
    if (path === "/settings") {
      return { allow: false, redirect: "/settings/account" };
    }
    return { allow: true };
  },
  async ({ path }) => {
    if (path.startsWith("/settings") || path.startsWith("/bookmarks")) {
      const ok = await authGuard();
      return ok
        ? { allow: true }
        : { allow: false, redirect: `/login?next=${encodeURIComponent(path)}` };
    }
    return { allow: true }; // publicznie
  },
];
