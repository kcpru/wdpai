import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("login-page")
export default class LoginPage extends ShadowComponent {
  connectedCallback() {
    this.html`
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
