import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        h1 {
          color: blue;
        }
      </style>
      <h1>Settings Page</h1>
      <y-route-outlet></y-route-outlet>
    `;
  }
}

customElements.define(`${WC_PREFIX}-settings-page`, SettingsPage);
