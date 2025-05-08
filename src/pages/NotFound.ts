import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";

export default class NotFound extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host {
          display: block;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        h1 {
          color: red;
        }
        p {
          font-size: 18px;
        }
        a {
          color: blue;
          text-decoration: underline;
        }
      </style>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        Go back to <a href="/">Home</a>
      </p>
    `;
  }
}

customElements.define(`${WC_PREFIX}-not-found-page`, NotFound);
