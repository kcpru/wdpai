import { WC_PREFIX } from "../../constants/config";

export default class SettingsSecurityPage extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <div>
        <h1>Security Settings</h1>
        <form id="security-settings-form">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <br />
          <label for="two-factor">Two-Factor Authentication:</label>
          <input type="checkbox" id="two-factor" name="two-factor" />
          <br />
          <button type="submit">Save Changes</button>
        </form>
      </div>
    `;
  }
}
customElements.define(
  `${WC_PREFIX}-settings-security-page`,
  SettingsSecurityPage
);
