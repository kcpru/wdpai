import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("login-page")
export default class LoginPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; max-width: 400px; margin: 2rem auto; padding: 0 1rem; }
        form { display: flex; flex-direction: column; gap: .75rem; }
        input { padding: .5rem; font-size: 1rem; }
        y-nav-link { margin-right: 1rem; }
        .lede { color: hsl(var(--muted-foreground)); }
        .error { color: #ff6b6b; font-size: .9rem; }
        .error[hidden] { display: none; }
      </style>

      <y-card>
        <div slot="header">
          <y-heading level="1">Welcome back</y-heading>
          <p class="lede">Sign in to continue your journey — secure, swift, and distraction-free.</p>
        </div>

        <form slot="body" id="login-form" novalidate>
          <y-field id="username" type="text" required regex="^[\\w.-]{3,32}$">
            <span slot="label">Username</span>
            <span slot="error-text">Enter your username.</span>
          </y-field>

          <y-field id="password" type="password" required regex="^.{8,}$">
            <span slot="label">Password</span>
            <span slot="helper-text">At least 8 characters. Avoid common words; mix letters, numbers, and symbols.</span>
            <span slot="error-text">Your password must be at least 8 characters long.</span>
          </y-field>

          <div class="meta-row">
            <label class="remember">
              <input type="checkbox" id="remember" />
              <span>Remember me on this device</span>
            </label>
            <y-nav-link href="/forgot-password">Forgot your password?</y-nav-link>
          </div>

          <y-button aria-label="Sign in" type="submit">
            Sign in
            <y-icon icon="login" slot="icon"></y-icon>
          </y-button>
          <div class="error" hidden></div>
        </form>
      </y-card>
    `;

    this.on("form#login-form", "submit", (e) =>
      this.handleSubmit(e as SubmitEvent)
    );
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const inputVal = (hostSel: string) => {
      const host = this.qs<HTMLElement>(hostSel);
      const input = host.shadowRoot?.querySelector(
        "input"
      ) as HTMLInputElement | null;
      return input?.value ?? "";
    };

    const body = {
      username: inputVal("#username").trim(),
      password: inputVal("#password"),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Login failed");

      // update auth cache if store exists
      try {
        const mod = await import("../stores/user");
        mod.setAuth?.(true);
      } catch {}

      const params = new URLSearchParams(location.search);
      const next = params.get("next") || "/";
      this.emit("navigate", next);
      history.pushState({}, "", next);
      this.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err: any) {
      const box = this.qs<HTMLDivElement>(".error");
      box.textContent = err.message ?? String(err);
      box.hidden = false;
    }
  }
}
