class MainHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					font-family: sans-serif;
					padding: 0 20px;
					background-color: #007bff;
					color: white;
				}
				h1 {
					font-size: 24px;
					margin: 0;
					padding: 20px 0;
				}
			</style>
			<h1><slot></slot></h1>
    `;
  }
}

customElements.define("main-header", MainHeader);
