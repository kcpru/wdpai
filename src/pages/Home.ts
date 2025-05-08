import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";

export default class Home extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <y-create-post></y-create-post>
      <y-post></y-post>
      <y-post></y-post>
      <y-post></y-post>
    `;
  }
}

customElements.define(`${WC_PREFIX}-home-page`, Home);
