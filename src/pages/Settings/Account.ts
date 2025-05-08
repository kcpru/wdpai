import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsAccountPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <div>
        <h1>Account Settings</h1>
        <form id="account-settings-form">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required />
          <br />
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required />
          <br />
          <button type="submit">Save Changes</button>
        </form>
      </div>
    `;
  }
}

customElements.define(
  `${WC_PREFIX}-settings-account-page`,
  SettingsAccountPage
);
