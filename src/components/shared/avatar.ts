import { ShadowComponent } from "../../utils/shadow-component";

export default class Avatar extends ShadowComponent {
  constructor() {
    super();

    this.html`
			<style>
				:host {
				  --avatar-size: var(--text-base);
				  background-color: var(--foreground);
					box-sizing: border-box;
					display: block;
					width: var(--avatar-size, var(--text-base));
					height: var(--avatar-size, var(--text-base));
				}
				:host([hidden]) {
					display: none;
				}
			</style>
			<div id="avatar"></div>
		`;
  }

  static get observedAttributes() {
    return ["src", "alt"];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === "src") this.renderAvatar(newValue);
  }

  renderAvatar(src: string) {
    const avatarElement = this.root!.querySelector("#avatar")!;
    avatarElement.innerHTML = `<img src="${src}" alt="${this.getAttribute("alt")}" />`;
  }
}
