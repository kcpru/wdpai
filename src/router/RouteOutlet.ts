import { WC_PREFIX } from "../constants/config.ts";
import { render } from "./router.ts";

export default class RouteOutlet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    window.addEventListener("popstate", () => render(location.pathname));
  }
  connectedCallback() {
    render(location.pathname);
  }
}

customElements.define(`${WC_PREFIX}-route-outlet`, RouteOutlet);
