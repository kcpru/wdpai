export default class Select extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: inline-block;
					font-family: sans-serif;
				}
				select {
					padding: 10px 20px;
					font-size: 16px;
					border: none;
					border-radius: 5px;
					cursor: pointer;
					outline: none;
				}
				select.primary {
					background-color: #007bff;
					color: white;
				}
				select:hover {
					filter: brightness(1.1);
				}
				select:active {
					filter: brightness(0.9);
				}
				select:disabled {
					background-color: #e9ecef;
					color: #6c757d;
					cursor: not-allowed;
				}
			</style>
			<select class="primary">
				<slot></slot>
			</select>
			`;
  }

  static get observedAttributes() {
    return ["variant", "disabled"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const select = this.shadowRoot.querySelector("select");
    if (name === "variant") {
      select.classList.remove(oldValue);
      select.classList.add(newValue);
    }
  }

  get variant() {
    return this.getAttribute("variant");
  }
  set variant(value) {
    this.setAttribute("variant", value);
  }

  get value() {
    return this.shadowRoot.querySelector("select").value;
  }
  set value(value) {
    this.shadowRoot.querySelector("select").value = value;
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
}
