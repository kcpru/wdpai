import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsSecurityPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; }
        form { display: flex; flex-direction: column; gap: .75rem; }
      </style>
      <form id="security-settings-form" novalidate>
        <y-field id="password" type="password" required regex="^(?=.*[A-Za-z])(?=.*\\d).{8,}$">
          <span slot="label">New password</span>
          <span slot="helper-text">At least 8 characters with a letter and a number.</span>
          <span slot="error-text">Use at least 8 characters including a letter and a number.</span>
        </y-field>

        <label style="display:flex; align-items:center; gap:.5rem;">
          <input type="checkbox" id="two-factor" />
          <span>Enable two-factor authentication</span>
        </label>

        <y-button type="submit">Save changes</y-button>
      </form>
    `;

    this.on("form#security-settings-form", "submit", (e) => {
      e.preventDefault();
      // TODO: implement saving via API when backend is ready
    });
  }
}
customElements.define(
  `${WC_PREFIX}-settings-security-page`,
  SettingsSecurityPage
);
