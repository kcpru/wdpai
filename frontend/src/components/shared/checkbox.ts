import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("checkbox")
export default class YCheckbox extends ShadowComponent {
  static get observedAttributes() {
    return ["checked", "disabled"];
  }

  private _checked = false;
  private _disabled = false;

  constructor() {
    super();
    this.tabIndex = 0; // focusable
  }

  get checked(): boolean {
    return this._checked;
  }
  set checked(v: boolean) {
    this._checked = Boolean(v);
    this.reflectState();
  }
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: boolean) {
    this._disabled = Boolean(v);
    this.reflectState();
  }

  connectedCallback() {
    this._checked = this.hasAttribute("checked");
    this._disabled = this.hasAttribute("disabled");
    this.render();
    this.reflectState();
    this.bind();
  }

  attributeChangedCallback(name: string) {
    if (name === "checked") this._checked = this.hasAttribute("checked");
    if (name === "disabled") this._disabled = this.hasAttribute("disabled");
    this.reflectState();
  }

  private render() {
    this.html`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          user-select: none;
          color: hsl(var(--foreground));
          --cb-size: 1.05rem;
        }
        :host([disabled]) { opacity: .6; cursor: not-allowed; }

        .box {
          width: var(--cb-size);
          height: var(--cb-size);
          border: 1.5px solid hsl(var(--border));
          border-radius: var(--radius-sm);
          background: hsl(var(--background));
          display: grid;
          place-items: center;
          transition: background .15s ease, border-color .15s ease;
        }
        :host([checked]) .box {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
        }

        .check {
          width: calc(var(--cb-size) - 0.35rem);
          height: calc(var(--cb-size) - 0.35rem);
          display: block;
          transform: scale(0);
          transition: transform .12s ease;
          color: hsl(var(--primary-foreground));
        }
        :host([checked]) .check { transform: scale(1); }

        .label { line-height: 1; }

        :host(:focus-visible) .box {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }
      </style>
      <div class="box" aria-hidden="true">
        <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <slot class="label"></slot>
    `;
    this.setAttribute("role", "checkbox");
  }

  private reflectState() {
    this.toggleAttribute("checked", !!this._checked);
    this.toggleAttribute("disabled", !!this._disabled);
    this.setAttribute("aria-checked", this._checked ? "true" : "false");
    if (this._disabled) this.setAttribute("aria-disabled", "true");
    else this.removeAttribute("aria-disabled");
  }

  private bind() {
    this.root.addEventListener("click", (e) => {
      if (this._disabled) return;
      this.toggle();
    });
    this.addEventListener("keydown", (e: KeyboardEvent) => {
      if (this._disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private toggle() {
    this.checked = !this.checked;
    // Mirror native change event semantics
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }
}
