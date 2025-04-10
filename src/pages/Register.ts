import { WC_PREFIX } from "../constants/config";

export default class RegisterPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        h1 {
          color: blue;
        }
      </style>
      <h1>Register Page</h1>
    `;
  }
}

customElements.define(`${WC_PREFIX}-register-page`, RegisterPage);
