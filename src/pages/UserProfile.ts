import { WC_PREFIX } from "../constants/config";

export default class UserProfile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        h1 {
          color: blue;
        }
      </style>
      <h1>User Profile Page</h1>
      <y-route-outlet></y-route-outlet>
    `;
  }
}

customElements.define(`${WC_PREFIX}-user-profile-page`, UserProfile);
