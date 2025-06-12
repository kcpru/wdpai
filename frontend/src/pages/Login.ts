import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("login-page")
export default class LoginPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        form { display: flex; flex-direction: column; gap: .75rem; }
        input { padding: .5rem; font-size: 1rem; }
        .error { color: red; margin-top: .5rem; }
      </style>
      <h1>Login</h1>

      <form id="login-form" novalidate>
        <label>
          Username
          <input id="username" required />
        </label>

        <label>
          Password
          <input id="password" type="password" required />
        </label>

        <button type="submit">Login</button>
        <div class="error" hidden></div>
      </form>

      <y-nav-link href="/">Home</y-nav-link>
      <y-nav-link href="/register">Register</y-nav-link>
    `;

    /* obsługa submit */
    this.on("form#login-form", "submit", (e) =>
      this.handleSubmit(e as SubmitEvent)
    );
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const $ = (sel: string) => this.qs<HTMLInputElement>(sel);

    const body = {
      username: $("#username").value.trim(),
      password: $("#password").value,
    };

    /* walidacja HTML5 już zrobiła robotę required */
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Login failed");

      /* sukces → przekieruj na stronę główną */
      this.emit("navigate", "/"); // jeśli masz własny router bus
      history.pushState({}, "", "/"); // fallback
      this.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err: any) {
      const box = this.qs<HTMLDivElement>(".error");
      box.textContent = err.message ?? String(err);
      box.hidden = false;
    }
  }
}
