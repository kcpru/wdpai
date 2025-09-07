type Route = {
  path: string;
  component: () => Promise<HTMLElement>;
  children?: Route[];
};

export const routes: Route[] = [
  {
    path: "",
    component: async () => new (await import("../pages/Home")).default(),
  },
  {
    path: "settings",
    component: async () =>
      new (await import("../pages/Settings/Settings")).default(),
    children: [
      {
        path: "account",
        component: async () =>
          new (await import("../pages/Settings/Account")).default(),
      },
      {
        path: "appearance",
        component: async () =>
          new (await import("../pages/Settings/Appearance")).default(),
      },
      {
        path: "password-and-authentication",
        component: async () =>
          new (await import("../pages/Settings/Security")).default(),
      },
    ],
  },
  {
    path: "login",
    component: async () => new (await import("../pages/Login")).default(),
  },
  {
    path: "register",
    component: async () => new (await import("../pages/Register")).default(),
  },
  {
    path: "search",
    component: async () => new (await import("../pages/Search")).default(),
  },
  {
    path: "bookmarks",
    component: async () => new (await import("../pages/Bookmarks")).default(),
  },
  {
    path: "admin",
    component: async () => new (await import("../pages/Admin")).default(),
  },
  {
    path: "mrok-ai",
    component: async () => new (await import("../pages/MrokAI")).default(),
  },
  {
    path: "@:username",
    component: async () => new (await import("../pages/UserProfile")).default(),
  },
];
