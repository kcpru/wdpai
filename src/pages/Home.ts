import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";

export default class Home extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: calc(2 * var(--spacing-xl));
        }
      </style>

      <y-create-post></y-create-post>
      <y-post></y-post>
      <y-post></y-post>
      <y-post></y-post>
    `;
  }
}

customElements.define(`${WC_PREFIX}-home-page`, Home);
