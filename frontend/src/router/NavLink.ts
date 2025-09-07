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

    // basic styles that respect theme via currentColor
    const style = document.createElement("style");
    style.textContent = `
      :host { color: inherit; }
      a { color: currentColor; text-decoration: none; }
      a:hover { text-decoration: underline; }
    `;
    this.root.appendChild(style);

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
