import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsAccountPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; }
        form { display: flex; flex-direction: column; gap: .75rem; }
      </style>
      <form id="account-settings-form" novalidate>
        <y-field id="username" type="text" required regex="^[\\w.-]{3,32}$">
          <span slot="label">Username</span>
          <span slot="helper-text">3–32 characters: letters, digits, dot, dash, or underscore.</span>
          <span slot="error-text">Enter a valid username (3–32, letters/digits/._-).</span>
        </y-field>

        <y-field id="email" type="email" required>
          <span slot="label">Email</span>
          <span slot="error-text">Please enter a valid email address.</span>
        </y-field>

        <y-button type="submit">Save changes</y-button>
      </form>
    `;

    this.on("form#account-settings-form", "submit", (e) => {
      e.preventDefault();
      // TODO: implement saving via API when backend is ready
    });
  }
}

customElements.define(
  `${WC_PREFIX}-settings-account-page`,
  SettingsAccountPage
);
