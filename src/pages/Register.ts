import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";

export default class RegisterPage extends ShadowComponent {
  constructor() {
    super();

    this.html`
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
