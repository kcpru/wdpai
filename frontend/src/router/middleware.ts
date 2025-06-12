import { authGuard } from "./guards";

type Middleware = (ctx: {
  path: string;
  params: Record<string, string>;
}) => Promise<{ allow: boolean; redirect?: string }>;

export const middlewares: Middleware[] = [
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
