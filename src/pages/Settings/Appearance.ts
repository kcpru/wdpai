import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsAppearancePage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <div>
        <h1>Appearance Settings</h1>
        <form id="appearance-settings-form">
          <label for="theme">Theme:</label>
          <select id="theme" name="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <br />
          <label for="font-size">Font Size:</label>
          <input type="number" id="font-size" name="font-size" min="10" max="30" required />
          <br />
          <button type="submit">Save Changes</button>
        </form>
      </div>
    `;
  }
}

customElements.define(
  `${WC_PREFIX}-settings-appearance-page`,
  SettingsAppearancePage
);
