import { icons } from "../constants/icons";

export default class Icon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
			<style>
				:host {
				box-sizing: border-box;
					display: block;
					width: var(--icon-size, var(--text-base));
					height: var(--icon-size, var(--text-base));
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
    const iconElement = this.shadowRoot!.querySelector("#icon")!;
    iconElement.innerHTML = icons[icon] ?? "";
  }
}
