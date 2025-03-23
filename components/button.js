class ButtonComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: inline-block;
					font-family: sans-serif;
				}
				button {
					padding: 10px 20px;
					font-size: 16px;
					border: none;
					border-radius: calc(var(--radius) / 2);
					cursor: pointer;
					outline: none;
				}
				button.primary {
					background-color: #007bff;
					color: white;
				}
				button.secondary {
					background-color: #6c757d;
					color: white;
				}
				button.success {
					background-color: #28a745;
					color: white;
				}
				button.danger {
					background-color: #dc3545;
					color: white;
				}
				button.warning {
					background-color: #ffc107;
					color: white;
				}
				button.info {
					background-color: #17a2b8;
					color: white;
				}
				button:hover {
					filter: brightness(1.1);
				}
				button:active {
					filter: brightness(0.9);
				}
				button:focus-visible {
					box-shadow: var(--shadow-outline);
				}
				button:disabled {
					opacity: 0.6;
					color: #6c757d;
					cursor: not-allowed;
				}
			</style>
			<button class="primary">
					<slot></slot>
			</button>
    `;
  }
  static get observedAttributes() {
    return ["variant", "disabled"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const button = this.shadowRoot.querySelector("button");
    button.className = newValue;
    if (name === "variant") {
      button.classList.remove(oldValue);
      button.classList.add(newValue);
    }
    if (name === "disabled") {
      if (newValue !== null) {
        button.disabled = true;
      } else {
        button.disabled = false;
      }
    }
  }
  get variant() {
    return this.getAttribute("variant");
  }
  set variant(value) {
    this.setAttribute("variant", value);
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

customElements.define("button-component", ButtonComponent);
