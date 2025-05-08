import { ShadowComponent } from "../../utils/shadow-component";

const typeRegexMap: Record<string, RegExp> = {
  email: /^[^@]+@[^@]+\.[^@]+$/,
  number: /^\d+$/,
  text: /^.*$/,
  url: /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/.*)?$/,
  tel: /^\+?\d{7,15}$/,
};

export default class Field extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        :host {
          display: block;
          border-radius: var(--radius-md);
          padding: var(--spacing-xl);
          background: transparent;
          transition: background-color 0.15s ease;
        }
        :host(:focus-within) {
          background: hsl(var(--ring) / 0.05);
        }
        label {
          font-weight: var(--font-medium);
          margin-bottom: var(--spacing-xs);
          font-style: normal;
          display: block;
        }
        .group {
          display: flex;
          align-items: center;
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          font-size: var(--text-base);
          background: hsl(var(--input));
        }
        .group:focus-within {
          box-shadow: var(--shadow-outline);
        }
        .addon {
          padding: 0 var(--spacing-md);
        }
        .addon:last-child {
          border-right: none;
        }
        input {
          flex: 1;
          font-size: inherit;
          background: transparent;
          border: none;
          color: inherit;
        }
        input:focus,
        input:active {
          outline: none;
        }
        input:focus-visible {
          outline: none;
        }
        .error {
          color: red;
          font-size: var(--text-xs);
          margin-top: var(--spacing-xs);
        }
        .helper {
          font-size: var(--text-xs);
          margin-top: var(--spacing-xs);
        }
        .invalid {
          border-color: #c84259;
        }
        .valid {
          border-color: #afd17f;
        }
      </style>

      <label>
        <slot name="label"></slot>
      </label>
      <div class="group">
        <span class="addon" id="start"><slot name="start-element"></slot></span>
        <input type="text" />
        <span class="addon" id="end"><slot name="end-element"></slot></span>
      </div>
      <span class="error" id="error"><slot name="error-text"></slot></span>
      <span class="helper" id="helper"><slot name="helper-text"></slot></span>
    `;
  }

  static get observedAttributes() {
    return [
      "type",
      "placeholder",
      "default-value",
      "regex",
      "disabled",
      "valid",
      "invalid",
      "required",
      "optional",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const input = this.qs<HTMLInputElement>("input");
    if (name === "type") input.type = newValue;
    if (name === "placeholder") input.placeholder = newValue;
    if (name === "default-value") input.value = newValue;
    if (name === "disabled") input.disabled = newValue !== null;
    if (name === "required") input.required = newValue !== null;
    if (name === "optional") input.required = newValue === null;
    if (name === "invalid") this.toggleValidation("invalid", newValue !== null);
    if (name === "valid") this.toggleValidation("valid", newValue !== null);
  }

  connectedCallback() {
    const input = this.qs("input");
    input.addEventListener("input", () => this.validate());
    input.addEventListener("blur", () => this.validate());

    const label = this.qs<HTMLLabelElement>("label");
    const slot = label.querySelector("slot");
    const labelText = slot!.assignedNodes()?.[0]?.textContent ?? "";
    const labelId = labelText.toLowerCase().replace(/\s+/g, "-");

    input.setAttribute("id", labelId);
    label.setAttribute("for", labelId);
  }

  validate() {
    const customRegex = this.getAttribute("regex");
    const type = this.getAttribute("type") || "text";
    const regex = customRegex
      ? new RegExp(customRegex)
      : typeRegexMap[type] || /.*/;

    const input = this.qs<HTMLInputElement>("input");
    const isValid = regex.test(input.value);
    this.toggleValidation("valid", isValid);
    this.toggleValidation("invalid", !isValid);
  }

  toggleValidation(className, condition) {
    const group = this.qs(".group");
    group.classList.toggle(className, condition);
  }
}
