import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

@WC("confirm")
export default class ConfirmDialog extends ShadowComponent {
  private resolver: ((v: boolean) => void) | null = null;
  private opts: Required<ConfirmOptions> = {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmText: "Confirm",
    cancelText: "Cancel",
  };

  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.attachHandlers();
  }

  private render() {
    this.html`
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 160ms cubic-bezier(.22,.61,.36,1);
        }
        :host([open]) {
          opacity: 1;
          pointer-events: auto;
        }
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.25);
          backdrop-filter: blur(6px);
          opacity: 0;
          transition: opacity 160ms cubic-bezier(.22,.61,.36,1);
        }
        :host([open]) .backdrop { opacity: 1; }
        .wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
        }
        .dialog {
          width: 100%;
          max-width: 28rem;
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-xl);
          box-shadow: 0 10px 30px rgba(0,0,0,.25);
          overflow: hidden;
          transform: translateY(8px) scale(.98);
          opacity: 0;
          transition:
            transform 180ms cubic-bezier(.22,.61,.36,1),
            opacity 150ms linear;
        }
        :host([open]) .dialog { transform: translateY(0) scale(1); opacity: 1; }
        header, footer { padding: var(--spacing-lg); }
        header { border-bottom: 1px solid hsl(var(--border)); }
        footer { border-top: 1px solid hsl(var(--border)); display: flex; gap: var(--spacing-sm); justify-content: flex-end; }
        h2 { margin: 0 0 .25rem 0; font-size: var(--text-xl); }
        p { margin: 0; color: hsl(var(--muted-foreground)); }

        @media (prefers-reduced-motion: reduce) {
          :host { transition: none; }
          .backdrop { transition: none; }
          .dialog { transition: opacity 100ms linear; transform: none; }
        }
      </style>
      <div class="backdrop" part="backdrop"></div>
      <div class="wrap" role="dialog" aria-modal="true" aria-labelledby="title" aria-describedby="desc">
        <div class="dialog" part="dialog">
          <header>
            <h2 id="title"></h2>
            <p id="desc"></p>
          </header>
          <footer>
            <y-button id="cancel" variant="outline"></y-button>
            <y-button id="confirm" variant="primary"></y-button>
          </footer>
        </div>
      </div>
    `;
    this.sync();
  }

  private sync() {
    this.qs<HTMLElement>("#title").textContent = this.opts.title;
    this.qs<HTMLElement>("#desc").textContent = this.opts.description;
    this.qs<HTMLElement>("#confirm").textContent = this.opts.confirmText;
    this.qs<HTMLElement>("#cancel").textContent = this.opts.cancelText;
  }

  private attachHandlers() {
    // Button events (custom element emits `click-event`)
    this.on("#confirm", "click-event" as any, () => this.close(true));
    this.on("#cancel", "click-event" as any, () => this.close(false));
    // Backdrop click cancels
    this.on(".backdrop", "click", () => this.close(false));
    // Escape cancels
    this.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") this.close(false);
    });
  }

  private openInternal() {
    this.setAttribute("open", "");
    // focus confirm for accessibility
    queueMicrotask(() => this.qs<HTMLElement>("#confirm").focus());
  }

  private close(result: boolean) {
    this.removeAttribute("open");
    const resolve = this.resolver;
    this.resolver = null;
    if (resolve) resolve(result);
  }

  open(opts?: ConfirmOptions): Promise<boolean> {
    this.opts = { ...this.opts, ...(opts || {}) };
    this.sync();
    this.openInternal();
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }
}
