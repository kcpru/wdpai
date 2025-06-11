import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";
import { render } from "./router";
import { WC } from "../utils/wc";

@WC("nav-link")
export default class NavLink extends ShadowComponent {
  constructor() {
    super();
    const href = this.attr("href") || "/";
    const a = document.createElement("a");

    a.href = href;
    a.textContent = this.textContent || href;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState({}, "", href);
      render(location.pathname);
    });
    this.root.appendChild(a);
  }
}
