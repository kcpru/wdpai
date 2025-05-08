import { WC_PREFIX } from "../constants/config.ts";
import { ShadowComponent } from "../utils/shadow-component.ts";
import { render } from "./router.ts";

export default class RouteOutlet extends ShadowComponent {
  constructor() {
    super();

    window.addEventListener("popstate", () => render(location.pathname));
  }

  connectedCallback() {
    render(location.pathname);
  }
}

customElements.define(`${WC_PREFIX}-route-outlet`, RouteOutlet);
