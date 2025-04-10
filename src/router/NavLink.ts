import { WC_PREFIX } from "../constants/config";
import { render } from "./router";

export default class NavLink extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const href = this.getAttribute("href") || "/";
    const a = document.createElement("a");

    a.href = href;
    a.textContent = this.textContent || href;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState({}, "", href);
      render(location.pathname);
    });
    shadow.appendChild(a);
  }
}

customElements.define(`${WC_PREFIX}-nav-link`, NavLink);
