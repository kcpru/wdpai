import { WC_PREFIX } from "../../constants/config";

export default class SettingsPage extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
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
