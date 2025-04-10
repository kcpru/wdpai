import { routes } from "./routes";
import { middlewares } from "./middleware";
import NotFound from "../pages/NotFound";

function parseSegments(path: string) {
  return path.split("/").filter(Boolean);
}

async function resolveComponentTree(
  segments: string[],
  routes: any[]
): Promise<{
  stack: HTMLElement[];
  params: Record<string, string>;
  path: string;
}> {
  const stack: HTMLElement[] = [];
  const params: Record<string, string> = {};
  let currentRoutes = routes;
  const pathParts: string[] = [];

  for (const segment of segments.length ? segments : [""]) {
    let matched = false;
    for (const route of currentRoutes) {
      const dynamic = route.path.startsWith(":") || route.path.startsWith("@:");
      const routeSegment = dynamic
        ? route.path.replace(/^@?:/, "")
        : route.path;
      const segmentMatch = dynamic ? true : segment === route.path;
      const isAt = route.path.startsWith("@:");
      if (segmentMatch && (!isAt || segment.startsWith("@"))) {
        if (route.guard && !(await route.guard()))
          return { stack: [], params, path: "/login" };
        const comp = await route.component();
        stack.push(comp);
        if (dynamic) params[routeSegment] = segment.replace(/^@/, "");
        currentRoutes = route.children || [];
        pathParts.push(segment);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  return { stack, params, path: "/" + pathParts.join("/") };
}

async function applyMiddleware(path: string, params: Record<string, string>) {
  for (const fn of middlewares) {
    const result = await fn({ path, params });
    if (!result.allow) {
      history.pushState({}, "", result.redirect);
      await render(result.redirect);
      return false;
    }
  }
  return true;
}

export async function render(path: string) {
  const outlet = document.querySelector("y-route-outlet")?.shadowRoot;
  if (!outlet) return;

  const {
    stack,
    params,
    path: fullPath,
  } = await resolveComponentTree(parseSegments(path), routes);
  if (!(await applyMiddleware(fullPath, params))) return;

  outlet.innerHTML = "";
  if (!stack.length) return outlet.appendChild(new NotFound());

  let target = outlet;
  for (const el of stack) {
    target.appendChild(el);
    const nested = el.shadowRoot?.querySelector("y-route-outlet")?.shadowRoot;
    if (!nested) break;
    target = nested;
  }
}
