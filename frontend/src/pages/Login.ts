import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";
import { toaster } from "../utils/toaster";
import { render } from "../router/index";

@WC("login-page")
export default class LoginPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
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

          <div class="meta-row" style="display:flex; align-items:center; justify-content:space-between; gap: .5rem;">
            <label class="remember" style="display:flex; align-items:center; gap:.5rem;">
              <y-checkbox id="remember">Remember me on this device</y-checkbox>
            </label>
            <y-nav-link href="/forgot-password">Forgot your password?</y-nav-link>
          </div>

          <y-button id="submit" aria-label="Sign in" type="submit" disabled>
            Sign in
            <y-icon icon="login" slot="icon"></y-icon>
          </y-button>
          <div class="error" hidden></div>
        </form>
      </y-card>
    `;

    // live validation: toggle button disabled
    this.on("#username", "input", () => this.updateDisabled());
    this.on("#password", "input", () => this.updateDisabled());
    // initial state
    this.updateDisabled();

    this.on("form#login-form", "submit", (e) =>
      this.handleSubmit(e as SubmitEvent)
    );
  }

  private isFieldValid(sel: string) {
    const host = this.qs<HTMLElement>(sel);
    const group = host?.shadowRoot?.querySelector(
      ".group"
    ) as HTMLElement | null;
    return group?.classList.contains("valid") ?? false;
  }

  private updateDisabled() {
    const valid =
      this.isFieldValid("#username") && this.isFieldValid("#password");
    const btn = this.qs<HTMLElement>("#submit");
    if (!btn) return;
    if (valid) btn.removeAttribute("disabled");
    else btn.setAttribute("disabled", "");
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
    // Optional: consume remember flag if backend supports persistent sessions later
    const remember = (this.qs("#remember") as any)?.checked === true;

    try {
      // prevent submit if invalid (defense-in-depth)
      if (!(this.isFieldValid("#username") && this.isFieldValid("#password"))) {
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Login failed");

      // update auth cache; fallback if dynamic import fails
      try {
        const mod = await import("../stores/user");
        mod.setAuth?.(true);
      } catch {
        try {
          localStorage.setItem("auth", "1");
        } catch {}
        window.dispatchEvent(new Event("auth-changed"));
      }

      // success toast
      toaster.create({
        type: "success",
        title: "Signed in",
        description: "You're now signed in.",
      });

      // Always redirect to home after successful login
      const target = "/";
      this.emit("navigate", target);
      history.pushState({}, "", target);
      render(location.pathname);
    } catch (err: any) {
      const box = this.qs<HTMLDivElement>(".error");
      box.textContent = err.message ?? String(err);
      box.hidden = false;
    }
  }
}
