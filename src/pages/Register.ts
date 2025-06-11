import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC(`register-page`)
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
