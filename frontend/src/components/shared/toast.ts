import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("toast")
export default class Toast extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        :host {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: var(--z-toast, 2147483000);
          display: block;
          pointer-events: none;
        }

        /* theming */
        :host { --toast-accent: hsl(var(--ring)); }
        :host([type="success"]) { --toast-accent: hsl(var(--primary)); }
        :host([type="error"]) { --toast-accent: hsl(var(--destructive)); }
        :host([type="warning"]) { --toast-accent: hsl(38 92% 50%); }
        :host([type="info"]) { --toast-accent: hsl(var(--ring)); }
        :host([type="loading"]) { --toast-accent: hsl(var(--ring)); }

        .toast {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: var(--spacing-xs) var(--spacing-md);
          align-items: start;
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          box-shadow: 0 10px 20px hsl(0 0% 0% / .15);
          opacity: 1; /* visible by default; animation enhances */
          transform: none;
          animation: toast-in var(--transition, .2s) ease-out forwards;
        }
        .accent {
          grid-row: 1 / span 2;
          width: 4px;
          align-self: stretch;
          background: var(--toast-accent);
          border-radius: var(--radius-md);
        }
        #title { margin: 0; font-weight: var(--font-semibold); }
        #description { margin: 0; color: hsl(var(--muted-foreground)); }

        .bar {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 3px;
          width: 100%;
          background: var(--toast-accent);
          border-bottom-left-radius: inherit;
          border-bottom-right-radius: inherit;
          transform-origin: left center;
        }
        .bar.animate { animation: shrink var(--bar-duration, 5s) linear forwards; }
        .bar.indeterminate { animation: indeterminate 1.1s ease-in-out infinite; }

        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes indeterminate {
          0% { left: 0; width: 10%; }
          50% { left: 45%; width: 20%; }
          100% { left: 100%; width: 10%; }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .toast { animation: none; opacity: 1; transform: none; }
          .bar.animate, .bar.indeterminate { animation: none; }
        }
        :host-context(:root.reduced-motion) .toast { animation: none; opacity: 1; transform: none; }
        :host-context(:root.reduced-motion) .bar.animate, :host-context(:root.reduced-motion) .bar.indeterminate { animation: none; }
      </style>

  <div class="toast" role="alert" aria-live="polite" style="pointer-events:auto;">
        <div class="accent" aria-hidden="true"></div>
        <h4 id="title"></h4>
        <p id="description"></p>
        <div class="bar" id="bar" aria-hidden="true"></div>
      </div>
    `;
  }

  connectedCallback() {
    this.render();
    this.updateBar();
  }

  static get observedAttributes() {
    return ["title", "description", "type", "duration", "indeterminate"];
  }

  attributeChangedCallback(name: string) {
    if (name === "title" || name === "description") this.render();
    if (name === "type" || name === "duration" || name === "indeterminate")
      this.updateBar(true);
  }

  render() {
    const title = this.attr("title");
    const description = this.attr("description");
    this.qs<HTMLDivElement>("#title").innerText = title ?? "";
    this.qs<HTMLDivElement>("#description").innerText = description ?? "";
  }

  private updateBar(restart = false) {
    const bar = this.qs<HTMLDivElement>("#bar");
    const indeterminate = this.hasAttr("indeterminate");
    const durationAttr = this.attr("duration");
    const ms = Number.parseInt(durationAttr || "5000", 10);
    bar.style.setProperty("--bar-duration", `${isFinite(ms) ? ms : 5000}ms`);
    bar.classList.toggle("indeterminate", indeterminate);
    // determinate animation
    const shouldAnimate = !indeterminate;
    if (restart || shouldAnimate) {
      bar.classList.remove("animate");
      // force reflow to restart animation
      void bar.offsetWidth;
      if (shouldAnimate) bar.classList.add("animate");
    }
  }
}
