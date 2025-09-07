import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("tabs")
export default class Tabs extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; }
        :host {
          --tabs-gap: var(--tabs-gap, .5rem);
          --tabs-border: var(--tabs-border, hsl(var(--border)));
          --tabs-color: var(--tabs-color, hsl(var(--muted-foreground)));
          --tabs-active-color: var(--tabs-active-color, hsl(var(--foreground)));
          --tabs-underline: var(--tabs-underline, hsl(var(--foreground)));
        }
        .tabs {
          display: flex;
          gap: var(--tabs-gap);
          border-bottom: 1px solid var(--tabs-border);
          margin-bottom: 1rem;
        }
        ::slotted(y-nav-link) {
          display: inline-flex;
          align-items: center;
          padding: .5rem .75rem;
          border-bottom: 2px solid transparent;
          color: var(--tabs-color);
          text-decoration: none;
        }
        ::slotted(y-nav-link[active]) {
          color: var(--tabs-active-color);
          border-bottom-color: var(--tabs-underline);
        }
      </style>
      <nav class="tabs">
        <slot></slot>
      </nav>
    `;

    const updateActive = () => {
      const slot = this.qs<HTMLSlotElement>("slot");
      const assigned = slot.assignedElements({ flatten: true });
      const mode = (this.getAttribute("match") || "prefix").toLowerCase();
      assigned.forEach((el) => {
        if (el.tagName !== "Y-NAV-LINK") return;
        const href = el.getAttribute("href") || "";
        const isActive =
          mode === "exact"
            ? location.pathname === href
            : location.pathname.startsWith(href);
        if (isActive) el.setAttribute("active", "");
        else el.removeAttribute("active");
      });
    };

    // update on navigation and slot changes
    updateActive();
    const slot = this.qs<HTMLSlotElement>("slot");
    slot.addEventListener("slotchange", updateActive);
    window.addEventListener("popstate", updateActive);
    this.addEventListener("click", () => setTimeout(updateActive, 0));
  }
}
