import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";
import { render } from "./router";
import { WC } from "../utils/wc";

declare global {
  interface Window {
    __routeOutletInitDone?: boolean;
    __routeOutletPopAdded?: boolean;
  }
}

@WC("route-outlet")
export default class RouteOutlet extends ShadowComponent {
  constructor() {
    super();

    if (!window.__routeOutletPopAdded) {
      window.addEventListener("popstate", () => render(location.pathname));
      window.__routeOutletPopAdded = true;
    }
  }

  connectedCallback() {
    if (!window.__routeOutletInitDone) {
      window.__routeOutletInitDone = true;
      render(location.pathname);
    }
  }
}
