type Middleware = (ctx: {
  path: string;
  params: Record<string, string>;
}) => Promise<{ allow: boolean; redirect?: string }>;

export const middlewares: Middleware[] = [
  async ({ path }) => {
    // if (path.startsWith("/settings") && !localStorage.getItem("auth_token")) {
    //   return { allow: false, redirect: "/login" };
    // }
    // return { allow: true };
    return { allow: true };
  },
];
