import { icons } from "../../constants/icons";
import { ShadowComponent } from "../../utils/shadow-component";

export default class Icon extends ShadowComponent {
  constructor() {
    super();

    this.html`
			<style>
				:host {
          box-sizing: border-box;
					display: block;
					width: var(--size, var(--text-base));
					height: var(--size, var(--text-base));
				}
				:host([hidden]) {
					display: none;
				}
			</style>
			<div id="icon"></div>
		`;
  }

  static get observedAttributes() {
    return ["icon"];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === "icon") this.renderIcon(newValue);
  }

  renderIcon(icon: string) {
    const iconElement = this.qs("#icon")!;
    iconElement.innerHTML = icons[icon] ?? "";
  }
}
