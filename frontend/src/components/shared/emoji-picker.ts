import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("emoji-picker")
export default class EmojiPicker extends ShadowComponent {
  static get observedAttributes() {
    return ["open", "value"];
  }

  private _value: string | null = null;
  private EMOJIS = [
    "😀",
    "😂",
    "😅",
    "😊",
    "😍",
    "😎",
    "🤩",
    "🤔",
    "😴",
    "😭",
    "😡",
    "🙃",
    "🤗",
    "🤤",
    "😇",
    "😬",
    "😤",
    "😌",
    "😜",
    "🤪",
    "🤠",
    "😳",
    "😏",
    "🥳",
  ];

  get value(): string | null {
    return this._value;
  }
  set value(v: string | null) {
    this._value = v && v.length ? v : null;
    if (this._value) this.setAttribute("value", this._value);
    else this.removeAttribute("value");
    this.render();
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    this.toggleAttribute("open", v);
    this.render();
  }

  connectedCallback() {
    this.render();
    this.root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t?.dataset?.emoji) {
        this.value = t.dataset.emoji || null;
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
          })
        );
      }
    });
  }

  attributeChangedCallback(name: string) {
    if (name === "value") {
      const v = this.getAttribute("value");
      this._value = v && v.length ? v : null;
    }
    this.render();
  }

  clear() {
    this.value = null;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const isOpen = this.open;
    const v = this._value;
    this.html`
      <style>
        :host { display: ${isOpen ? "grid" : "none"}; grid-template-columns: repeat(8, 2rem); gap: .25rem; padding: .5rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); background: hsl(var(--popover)); color: hsl(var(--popover-foreground)); }
        button.emoji { width: 2rem; height: 2rem; display: grid; place-items: center; border: 1px solid transparent; background: transparent; border-radius: .5rem; cursor: pointer; font-size: 1.1rem; }
        button.emoji[aria-pressed="true"] { border-color: hsl(var(--primary)); box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2) inset; }
        button.emoji:focus-visible { outline: none; box-shadow: var(--shadow-outline); }
      </style>
      ${this.EMOJIS.map((e) => `<button type="button" class="emoji" data-emoji="${e}" aria-label="${e}" aria-pressed="${v === e}">${e}</button>`).join("")}
    `;
  }
}
