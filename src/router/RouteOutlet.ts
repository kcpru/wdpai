import { WC_PREFIX } from "../constants/config.ts";
import { ShadowComponent } from "../utils/shadow-component.ts";
import { render } from "./router.ts";

declare global {
  interface Window {
    __routeOutletInitDone?: boolean;
    __routeOutletPopAdded?: boolean;
  }
}

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

customElements.define(`${WC_PREFIX}-route-outlet`, RouteOutlet);
