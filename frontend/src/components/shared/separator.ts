import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("separator")
export default class Separator extends ShadowComponent {
  constructor() {
    super();
    this.html`
      <style>
        :host {
          display: block;
          border-bottom: 1px solid red;
          margin: 1.5rem 0;
          width: 100%;
          flex-shrink: 0;
        }
      </style>
      <hr />
    `;
  }
}
