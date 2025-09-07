import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("heading")
export default class Heading extends ShadowComponent {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["level"];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === "level") this.renderHeading(newValue);
  }

  connectedCallback() {
    const level = this.getAttribute("level") || "1";
    this.renderHeading(level);
  }

  renderHeading(level: string) {
    const validLevels = ["1", "2", "3", "4", "5", "6"];
    if (!validLevels.includes(level)) level = "1";
    const styles = `
      <style>
        :host { display: block; }
        h1 { font-size: 2rem; margin: 0; }
        h2 { font-size: 1.5rem; margin: 0; }
        h3 { font-size: 1.25rem; margin: 0; }
        h4 { font-size: 1.1rem; margin: 0; }
        h5 { font-size: 1rem; margin: 0; }
        h6 { font-size: 0.875rem; margin: 0; }
      </style>
    `;
    this.root.innerHTML = `${styles}<h${level}><slot></slot></h${level}>`;
  }
}
