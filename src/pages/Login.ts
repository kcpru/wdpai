import { WC_PREFIX } from "../constants/config";

export default class LoginPage extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <div>
        <h1>Login</h1>
        <form id="login-form">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required />
          <br />
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <br />
          <button type="submit">Login</button>
        </form>

        <y-nav-link href="/">Home</y-nav-link>
        <y-nav-link href="/register">Register</y-nav-link>
      </div>
    `;
  }
}

customElements.define(`${WC_PREFIX}-login-page`, LoginPage);
