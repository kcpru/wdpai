// router.ts — v4 (fault-tolerant nested outlets)
import { routes } from "./routes";
import { middlewares } from "./middleware";
import NotFound from "../pages/NotFound";

let isRendering = false;

/* ---------- typings ---------- */
export interface Route {
  path: string;
  component: () => Promise<HTMLElement>;
  guard?: () => boolean | Promise<boolean>;
  children?: Route[];
}
interface ResolveRes {
  stack: HTMLElement[];
  params: Record<string, string>;
  consumed: string[];
  unmatched: boolean;
}

/* ---------- helpers ---------- */
const ROOT = "";
const split = (p: string) => p.split("/").filter(Boolean);
const isDynamic = (p: string) => /^@?:/.test(p);
const isAt = (p: string) => p.startsWith("@:");

/** wait until the particular <y-route-outlet> instance is upgraded */
const whenOutletReady = (el: HTMLElement | null) =>
  el && (el as any).shadowRoot
    ? Promise.resolve()
    : new Promise<void>((res) => {
        if (!el) return res();
        customElements.whenDefined("y-route-outlet").then(() => {
          if ((el as any).shadowRoot) return res();
          // fallback: observe until it upgrades
          const mo = new MutationObserver(() => {
            if ((el as any).shadowRoot) {
              mo.disconnect();
              res();
            }
          });
          mo.observe(el, { childList: false });
        });
      });

/* ---------- resolver ---------- */
async function resolvePath(
  segments: string[],
  table: readonly Route[]
): Promise<ResolveRes | null> {
  const stack: HTMLElement[] = [];
  const params: Record<string, string> = {};
  const consumed: string[] = [];
  let unmatched = false;

  let routes = table;
  const queue = segments.length ? segments : [ROOT];

  for (const seg of queue) {
    let hit: Route | undefined;

    for (const r of routes) {
      const ok = isDynamic(r.path)
        ? !isAt(r.path) || seg.startsWith("@")
        : r.path === seg || (r.path === ROOT && seg === ROOT);
      if (!ok) continue;

      if (r.guard && !(await r.guard())) return null; // redirect inside guard
      hit = r;

      const el = await r.component();
      stack.push(el);

      if (isDynamic(r.path))
        params[r.path.replace(/^@?:/, "")] = seg.replace(/^@/, "");

      routes = r.children ?? [];
      consumed.push(seg);
      break;
    }
    if (!hit) {
      unmatched = true;
      break;
    }
  }
  return { stack, params, consumed, unmatched };
}

/* ---------- middleware ---------- */
async function runMiddlewares(path: string, params: Record<string, string>) {
  for (const mw of middlewares) {
    const res = await mw({ path, params });
    if (res.allow) continue;

    history.pushState({}, "", res.redirect);
    if (res.redirect) await render(res.redirect);
    return false;
  }
  return true;
}

/* ---------- DOM mounting ---------- */
async function mountStack(
  host: ShadowRoot,
  stack: readonly HTMLElement[],
  unmatchedTail: boolean
) {
  host.innerHTML = "";

  let target: ShadowRoot | null = host;
  for (let i = 0; i < stack.length; i++) {
    const el = stack[i];
    target!.appendChild(el);

    if (i === stack.length - 1) break; // last component – done

    await Promise.resolve(); // microtask for upgrade
    const outletEl = el.shadowRoot?.querySelector(
      "y-route-outlet"
    ) as HTMLElement | null;
    await whenOutletReady(outletEl);
    const nested = outletEl?.shadowRoot ?? null;

    if (!nested) {
      el.shadowRoot?.appendChild(new NotFound());
      return;
    }
    target = nested;
  }

  if (unmatchedTail) target?.appendChild(new NotFound());
}

/* ---------- public API ---------- */
export async function render(path: string) {
  if (isRendering) return; // ▼ blokuje re-kurencyjne wywołania
  isRendering = true;
  try {
    const rootOutlet = document.querySelector("y-route-outlet")?.shadowRoot;
    if (!rootOutlet) return;

    const res = await resolvePath(split(decodeURI(path)), routes);
    if (!res) return; // guard redirected
    const { stack, params, consumed, unmatched } = res;

    if (!(await runMiddlewares("/" + consumed.join("/"), params))) return;

    if (!stack.length) {
      rootOutlet.innerHTML = "";
      rootOutlet.appendChild(new NotFound());
      return;
    }

    await mountStack(rootOutlet, stack, unmatched);
  } finally {
    isRendering = false;
  }
}
