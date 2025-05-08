export abstract class ShadowComponent extends HTMLElement {
  protected readonly root: ShadowRoot;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    if (!shadow) throw new Error("Failed to attach shadow root");
    this.root = shadow;
  }

  protected qs<T extends Element = Element>(selector: string): T {
    const el = this.root.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);
    return el as T;
  }

  protected qsa<T extends Element = Element>(selector: string): NodeListOf<T> {
    return this.root.querySelectorAll(selector) as NodeListOf<T>;
  }

  protected on<K extends keyof HTMLElementEventMap>(
    selector: string,
    event: K,
    handler: (ev: HTMLElementEventMap[K]) => void
  ): void {
    this.qs(selector).addEventListener(event, handler as EventListener);
  }

  protected emit<T = undefined>(type: string, detail?: T): void {
    this.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  protected attr(name: string): string | null {
    return this.getAttribute(name);
  }

  protected hasAttr(name: string): boolean {
    return this.hasAttribute(name);
  }

  protected html(strings: TemplateStringsArray, ...values: unknown[]) {
    this.root.innerHTML = String.raw({ raw: strings }, ...values);
  }
}
