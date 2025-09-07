import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

const typeRegexMap: Record<string, RegExp> = {
  email: /^[^@]+@[^@]+\.[^@]+$/,
  number: /^\d+$/,
  text: /^.*$/,
  url: /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/.*)?$/,
  tel: /^\+?\d{7,15}$/,
};

@WC("field")
export default class Field extends ShadowComponent {
  private touched = false;

  constructor() {
    super();

    this.html`
      <style>
        :host {
          display: block;
          border-radius: var(--radius-md);
          background: transparent;
          transition: background-color 0.15s ease;
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
          border: 1px solid transparent;
        }
        .group:focus-within { box-shadow: var(--shadow-outline); }
        .addon { padding: 0 var(--spacing-md); display: inline-flex; align-items: center; }
        .addon[hidden] { display: none; }

        input {
          flex: 1;
          font-size: inherit;
          background: transparent;
          border: none;
          color: inherit;
          min-width: 0;
        }
        input:focus, input:active, input:focus-visible { outline: none; }

        .error {
          color: #ff6b6b;
          font-size: var(--text-xs);
          margin-top: var(--spacing-xs);
        }
        .error[hidden] { display: none; }

        .helper {
          font-size: var(--text-xs);
          margin-top: var(--spacing-xs);
          color: hsl(var(--muted-foreground));
        }
        .helper[hidden] { display: none; }

        .invalid { border-color: #c8425950; }
        .valid { border-color: #afd17f50; }
      </style>

      <label>
        <slot name="label"></slot>
      </label>
      <div class="group">
        <span class="addon" id="start"><slot name="start-element"></slot></span>
        <input type="text" />
        <span class="addon" id="end"><slot name="end-element"></slot></span>
      </div>
      <span class="error" id="error" hidden><slot name="error-text"></slot></span>
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

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ) {
    const input = this.qs<HTMLInputElement>("input");
    if (!input) return;

    if (name === "type") input.type = newValue ?? "text";
    if (name === "placeholder") input.placeholder = newValue ?? "";
    if (name === "default-value" && newValue !== null) input.value = newValue;
    if (name === "disabled") input.disabled = newValue !== null;
    if (name === "required") input.required = newValue !== null;
    if (name === "optional") input.required = newValue === null;

    if (name === "invalid") this.toggleValidation("invalid", newValue !== null);
    if (name === "valid") this.toggleValidation("valid", newValue !== null);

    if (["type", "regex", "required", "optional"].includes(name))
      this.validate();
  }

  connectedCallback() {
    const input = this.qs<HTMLInputElement>("input");
    input.addEventListener("input", () => {
      if (!this.touched) this.touched = true;
      this.validate();
    });
    input.addEventListener("blur", () => {
      if (!this.touched) this.touched = true;
      this.validate();
    });

    const label = this.qs<HTMLLabelElement>("label");
    const slot = label.querySelector("slot");
    const labelText = slot!.assignedNodes()?.[0]?.textContent ?? "";
    const labelId =
      labelText.toLowerCase().trim().replace(/\s+/g, "-") ||
      `field-${Math.random().toString(36).slice(2)}`;

    input.setAttribute("id", labelId);
    label.setAttribute("for", labelId);

    this.wireSlotVisibility();
    this.validate();
  }

  private wireSlotVisibility() {
    const startSlot = this.qs<HTMLSlotElement>('slot[name="start-element"]');
    const endSlot = this.qs<HTMLSlotElement>('slot[name="end-element"]');
    const startBox = this.qs<HTMLSpanElement>("#start");
    const endBox = this.qs<HTMLSpanElement>("#end");

    const update = (slot: HTMLSlotElement, box: HTMLElement) => {
      const has = slot.assignedElements({ flatten: true }).length > 0;
      if (has) box.removeAttribute("hidden");
      else box.setAttribute("hidden", "");
    };

    startSlot.addEventListener("slotchange", () => update(startSlot, startBox));
    endSlot.addEventListener("slotchange", () => update(endSlot, endBox));

    // initial
    update(startSlot, startBox);
    update(endSlot, endBox);
  }

  validate() {
    const input = this.qs<HTMLInputElement>("input");
    const value = input.value ?? "";

    const customRegex = this.attr("regex");
    const type = this.attr("type") || "text";
    const regex = customRegex
      ? new RegExp(customRegex)
      : typeRegexMap[type] || /.*/;

    const required = input.required;
    const empty = value.length === 0;

    let isValid = regex.test(value);
    if (!required && empty) isValid = true;
    if (required && empty) isValid = false;

    this.toggleValidation("valid", isValid && (!required || !empty));
    this.toggleValidation("invalid", this.touched && !isValid);

    const error = this.qs<HTMLElement>("#error");
    if (this.touched && !isValid) error.removeAttribute("hidden");
    else error.setAttribute("hidden", "");
  }

  toggleValidation(className: string, condition: boolean) {
    const group = this.qs(".group");
    group.classList.toggle(className, !!condition);
  }
}
