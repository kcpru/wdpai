export default class Avatar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
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
    const avatarElement = this.shadowRoot!.querySelector("#avatar")!;
    avatarElement.innerHTML = `<img src="${src}" alt="${this.getAttribute("alt")}" />`;
  }
}
