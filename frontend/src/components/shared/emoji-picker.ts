import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("emoji-picker")
export default class EmojiPicker extends ShadowComponent {
  static get observedAttributes() {
    return ["open", "value", "instant"];
  }

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

  connectedCallback() {
    if (!this.hasAttribute("instant")) this.setAttribute("instant", "");
    this.render();
    const ps = this.qs<any>("#ps");
    if (ps) {
      ps.items = this.EMOJIS;
      ps.placeholder = "Search emoji";
      // forward change/cancel
      ps.addEventListener("change", (e: any) => {
        const v = e?.detail?.value || null;
        if (v) this.setAttribute("value", v);
        else this.removeAttribute("value");
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { value: v },
            bubbles: true,
            composed: true,
          })
        );
      });
      ps.addEventListener("cancel", () => {
        this.dispatchEvent(
          new CustomEvent("cancel", { bubbles: true, composed: true })
        );
      });
    }
  }

  attributeChangedCallback(name: string) {
    const ps = this.qs<any>("#ps");
    if (!ps) return;
    if (name === "value") {
      const v = this.getAttribute("value");
      ps.value = v && v.length ? v : null;
    }
    if (name === "instant") ps.instant = this.hasAttribute("instant");
    if (name === "open") ps.open = this.hasAttribute("open");
  }

  get value(): string | null {
    return this.getAttribute("value");
  }
  set value(v: string | null) {
    if (v) this.setAttribute("value", v);
    else this.removeAttribute("value");
    const ps = this.qs<any>("#ps");
    if (ps) ps.value = v;
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    const ps = this.qs<any>("#ps");
    if (ps) ps.open = v;
    this.toggleAttribute("open", v);
  }

  get instant(): boolean {
    return this.hasAttribute("instant");
  }
  set instant(v: boolean) {
    this.toggleAttribute("instant", v);
    const ps = this.qs<any>("#ps");
    if (ps) ps.instant = v;
  }

  openAt(anchor: HTMLElement) {
    const ps = this.qs<any>("#ps");
    this.setAttribute("open", "");
    ps?.openAt(anchor);
  }
  close() {
    const ps = this.qs<any>("#ps");
    this.removeAttribute("open");
    ps?.close();
  }
  clear() {
    this.value = null;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: null },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const instant = this.hasAttribute("instant");
    const v = this.getAttribute("value") || "";
    this.html`
      <style>:host{display:contents}</style>
      <y-popup-select id="ps" ${instant ? "instant" : ""} value="${v}"></y-popup-select>
    `;
  }
}
