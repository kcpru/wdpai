class FieldComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        label {
          font-size: 16px;
          margin-bottom: 8px;
          font-style: normal;
          display: block;
        }
        .group {
          display: flex;
          align-items: center;
          border: 1px solid hsl(var(--accent));
          border-radius: 5px;
          overflow: hidden;
          padding: 10px;
          font-size: 16px;
        }
        .addon {
          background: #f1f1f1;
          padding: 10px;
          border-right: 1px solid #ced4da;
        }
        .addon:last-child {
          border-left: 1px solid #ced4da;
          border-right: none;
        }
        input {
          flex: 1;
          border: none;
          outline: none;
          font-size: inherit;
        }
        .error {
          color: red;
          font-size: 12px;
          margin-top: 4px;
        }
        .helper {
          color: #6c757d;
          font-size: 12px;
          margin-top: 4px;
        }
        .invalid {
          border-color: red;
        }
        .valid {
          border-color: green;
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
      <p class="error" id="error"><slot name="error-text"></slot></p>
      <p class="helper" id="helper"><slot name="helper-text"></slot></p>
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
    const input = this.shadowRoot.querySelector("input");
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
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("input", () => this.validate());
    input.addEventListener("blur", () => this.validate());

    const label = this.shadowRoot.querySelector("label");
    const slot = label.querySelector("slot");
    const labelName = slot
      .assignedNodes()[0]
      .textContent.toLocaleLowerCase()
      .split(" ")
      .join("-");
    input.setAttribute("id", labelName);
    label.setAttribute("for", labelName);
  }

  validate() {
    const typeRegexMap = {
      email: /^[^@]+@[^@]+\.[^@]+$/,
      number: /^\d+$/,
      text: /^.*$/,
      url: /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/.*)?$/,
      tel: /^\+?\d{7,15}$/,
    };
    const customRegex = this.getAttribute("regex");
    const inputType = this.getAttribute("type") || "text";
    const regex = customRegex
      ? new RegExp(customRegex)
      : typeRegexMap[inputType] || /.*/;

    const input = this.shadowRoot.querySelector("input");
    const isValid = regex.test(input.value);
    this.toggleValidation("valid", isValid);
    this.toggleValidation("invalid", !isValid);
  }

  toggleValidation(className, condition) {
    const group = this.shadowRoot.querySelector(".group");
    if (condition) {
      group.classList.add(className);
    } else {
      group.classList.remove(className);
    }
  }
}

customElements.define("field-component", FieldComponent);
