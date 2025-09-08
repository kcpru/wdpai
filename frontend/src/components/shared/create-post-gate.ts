import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";
import { getAuthCached, isAuthenticated } from "../../stores/user";

@WC("create-post-gate")
export default class CreatePostGate extends ShadowComponent {
  private authed = false;

  constructor() {
    super();
  }

  async connectedCallback() {
    const cached = getAuthCached();
    this.authed =
      cached !== null ? cached : await isAuthenticated().catch(() => false);
    this.render();
    this.attachHandlers();

    window.addEventListener("auth-changed", async () => {
      const c = getAuthCached();
      this.authed = c !== null ? c : await isAuthenticated().catch(() => false);
      this.render();
      this.attachHandlers();
    });
  }

  private go(path: string) {
    const next = encodeURIComponent(location.pathname);
    history.pushState({}, "", `${path}?next=${next}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  private attachHandlers() {
    if (this.authed) return;
    this.qs("#go-login")?.addEventListener("click-event" as any, () =>
      this.go("/login")
    );
    this.qs("#go-register")?.addEventListener("click-event" as any, () =>
      this.go("/register")
    );
  }

  render() {
    if (this.authed) {
      this.html`
        <y-create-post></y-create-post>
      `;
      return;
    }

    this.html`
      <style>
        :host { display: block; width: 100%; }
        .prompt {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          background: hsl(var(--secondary));
          border: 1px dashed hsl(var(--border));
          width: 100%;
          max-width: var(--sm);
        }
        .prompt p { color: hsl(var(--muted-foreground)); margin: 0; }
        .prompt .actions { display: flex; gap: var(--spacing-sm); }
      </style>
      
      <div class="prompt">
        <p>To publish a post, please sign in or register.</p>
        <div class="actions">
          <y-button id="go-login" variant="outline">Sign in</y-button>
          <y-button id="go-register" variant="primary">Register</y-button>
        </div>
      </div>
    `;
  }
}
