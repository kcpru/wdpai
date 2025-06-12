import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("select")
export default class Select extends ShadowComponent {
  constructor() {
    super();

    this.html`
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
    const select = this.qs("select");
    if (name === "variant") {
      select.classList.remove(oldValue);
      select.classList.add(newValue);
    }
  }

  get variant() {
    return this.attr("variant") || "";
  }
  set variant(value: string) {
    this.setAttr("variant", value);
  }

  get value() {
    return this.qs<HTMLSelectElement>("select").value;
  }
  set value(value) {
    this.qs<HTMLSelectElement>("select").value = value;
  }

  get disabled() {
    return this.hasAttr("disabled");
  }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
}
