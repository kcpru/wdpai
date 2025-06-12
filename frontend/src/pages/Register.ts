import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("register-page")
export default class RegisterPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <h1>Register</h1>
      <form id="reg" novalidate>
        <label>Username <input id="u" required /></label>
        <label>Password <input id="p" type="password" required /></label>
        <button type="submit">Create account</button>
        <div class="error" hidden></div>
      </form>
      <y-nav-link href="/login">Back to login</y-nav-link>
    `;

    this.on("#reg", "submit", (e) => this.register(e as SubmitEvent));
  }

  private async register(e: SubmitEvent) {
    e.preventDefault();
    const username = this.qs<HTMLInputElement>("#u").value.trim();
    const password = this.qs<HTMLInputElement>("#p").value;

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Register failed");

      await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      history.pushState({}, "", "/");
      this.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err: any) {
      const box = this.qs<HTMLDivElement>(".error");
      box.textContent = err.message ?? String(err);
      box.hidden = false;
    }
  }
}
