import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("select")
export default class Select extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        :host { display: inline-block; color: inherit; }
        :host([block]) { display: block; }
        :host([block]) select { width: 100%; }

        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          font: inherit;
          line-height: 1.2;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--secondary));
          border-radius: var(--radius-md);
          outline: none;
          cursor: pointer;
          transition: background-color .15s ease, border-color .15s ease, box-shadow .15s ease;
        }
        select:focus-visible { box-shadow: var(--shadow-outline); }
        select:disabled { opacity: .6; cursor: not-allowed; }

        /* variants */
        :host([variant="outline"]) select {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        :host([variant="ghost"]) select {
          background: transparent;
          border-color: transparent;
        }

        /* hide source options */
        slot { display: none; }
      </style>
      <select id="native"></select>
      <slot id="source"></slot>
    `;

    // sync assigned <option> nodes into internal <select>
    const src = this.qs<HTMLSlotElement>("#source");
    const select = this.qs<HTMLSelectElement>("#native");

    const sync = () => {
      const assigned = src.assignedNodes({ flatten: true });
      // Clear existing
      select.innerHTML = "";
      for (const node of assigned) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as HTMLElement;
        if (el.tagName === "OPTION" || el.tagName === "OPTGROUP") {
          select.appendChild(el.cloneNode(true));
        }
      }
      // preserve selected by value
      if (this._value != null) {
        select.value = this._value;
      }
    };

    src.addEventListener("slotchange", sync);
    sync();

    // re-emit change and keep value property in sync
    select.addEventListener("change", () => {
      this._value = select.value;
      this.dispatchEvent(
        new Event("change", { bubbles: true, composed: true })
      );
    });
  }

  static get observedAttributes() {
    return ["variant", "disabled", "block"];
  }

  private _value: string | null = null;

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ) {
    const select = this.qs<HTMLSelectElement>("#native");
    if (name === "disabled") {
      newValue !== null
        ? select.setAttribute("disabled", "")
        : select.removeAttribute("disabled");
    }
  }

  get value(): string {
    const select = this.qs<HTMLSelectElement>("#native");
    return select.value;
  }
  set value(value: string) {
    this._value = value;
    const select = this.qs<HTMLSelectElement>("#native");
    select.value = value;
  }

  get disabled(): boolean {
    return this.hasAttr("disabled");
  }
  set disabled(v: boolean) {
    v ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }
}
