import { WC_PREFIX } from "../constants/config";

export default class Home extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <y-create-post></y-create-post>
      <y-post></y-post>
      <y-post></y-post>
      <y-post></y-post>
    `;
  }
}

customElements.define(`${WC_PREFIX}-home-page`, Home);
