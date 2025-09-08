import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("popup-select")
export default class PopupSelect extends ShadowComponent {
  static get observedAttributes() {
    return ["open", "value", "instant", "placeholder"];
  }

  private _value: string | null = null;
  private _draft: string | null = null;
  private _pos: { top: number; left: number } | null = null;
  private _items: string[] = [];
  private _filtered: string[] = [];
  private _q: string = "";
  searcher?: (q: string) => Promise<string[] | null> | string[] | null;
  private _outside?: (e: Event) => void;

  get value(): string | null {
    return this._value;
  }
  set value(v: string | null) {
    this._value = v && v.length ? v : null;
    if (this._value) this.setAttribute("value", this._value);
    else this.removeAttribute("value");
    if (!this.open) this._draft = this._value;
    this.render();
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    this.toggleAttribute("open", v);
    if (v) this._draft = this._value; // reset draft on open
    // manage outside click listener
    if (v) this.attachOutside();
    else this.detachOutside();
    this.render();
  }

  get instant(): boolean {
    return this.hasAttribute("instant");
  }
  set instant(v: boolean) {
    this.toggleAttribute("instant", v);
    this.render();
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") || "Type to search";
  }
  set placeholder(v: string) {
    this.setAttribute("placeholder", v);
    this.render();
  }

  set items(list: string[]) {
    this._items = Array.isArray(list) ? list.slice(0) : [];
    this.applyFilter();
  }
  get items(): string[] {
    return this._items.slice(0);
  }

  connectedCallback() {
    if (!this.hasAttribute("instant")) this.setAttribute("instant", "");
    this.render();
    this.root.addEventListener("input", (e) => {
      const t = e.target as HTMLInputElement;
      if (t?.id === "q") {
        this._q = t.value;
        this.debouncedSearch();
      }
    });
    this.root.addEventListener("keydown", (e) => {
      const ke = e as KeyboardEvent;
      const t = e.target as HTMLElement;
      if (t?.id === "q" && ke.key === "Enter") {
        e.preventDefault();
        const pick = (this._q || this._draft || "").trim();
        if (!pick) return;
        if (this.instant) {
          this.value = pick;
          this.dispatchEvent(
            new CustomEvent("change", {
              detail: { value: this.value },
              bubbles: true,
              composed: true,
            })
          );
          this.close();
        } else {
          this._draft = pick;
          this.render();
        }
      }
    });
    this.root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t?.dataset?.val) {
        const v = t.dataset.val || "";
        this._draft = v;
        if (this.instant) {
          this.value = v;
          this.dispatchEvent(
            new CustomEvent("change", {
              detail: { value: this.value },
              bubbles: true,
              composed: true,
            })
          );
          this.close();
        } else {
          this.render();
        }
      }
      if (t?.id === "save") {
        this.value = this._draft;
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
          })
        );
        this.close();
      }
      if (t?.id === "reset") {
        this._draft = null;
        if (this.instant) {
          this.value = null;
          this.dispatchEvent(
            new CustomEvent("change", {
              detail: { value: this.value },
              bubbles: true,
              composed: true,
            })
          );
          this.close();
        } else {
          this.render();
        }
      }
      if (t?.id === "cancel") {
        this._draft = this._value;
        this.dispatchEvent(
          new CustomEvent("cancel", { bubbles: true, composed: true })
        );
        this.close();
      }
    });
  }

  private _searchTimer?: number;
  private debouncedSearch() {
    if (this._searchTimer) window.clearTimeout(this._searchTimer);
    this._searchTimer = window.setTimeout(() => this.runSearch(), 120);
  }
  private async runSearch() {
    const q = this._q.trim();
    if (typeof this.searcher === "function") {
      try {
        const res = await this.searcher(q);
        this._filtered = Array.isArray(res) ? res : [];
      } catch {
        this._filtered = [];
      }
    } else {
      this.applyFilter();
    }
    this.render();
  }
  private applyFilter() {
    const q = this._q.trim().toLowerCase();
    if (!q) this._filtered = this._items.slice(0, 200);
    else
      this._filtered = this._items
        .filter((s) => s.toLowerCase().includes(q))
        .slice(0, 200);
  }

  attributeChangedCallback(name: string) {
    if (name === "value") {
      const v = this.getAttribute("value");
      this._value = v && v.length ? v : null;
    }
    this.render();
  }

  openAt(anchor: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const top = rect.bottom + gap;
    const width = 280;
    let left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - width - 8)
    );
    this._pos = { top, left };
    this.open = true;
    // reset query and filter on open
    this._q = "";
    this.applyFilter();
    this.render();
    // focus input after render
    queueMicrotask(() => {
      const input = this.root.querySelector<HTMLInputElement>("#q");
      input?.focus();
      input?.select?.();
    });
  }

  close() {
    this.open = false;
    this._pos = null;
    this.render();
  }

  private attachOutside() {
    this.detachOutside();
    this._outside = (e: Event) => {
      const path = (e as any).composedPath?.() || [];
      if (!path.includes(this)) {
        this.dispatchEvent(
          new CustomEvent("cancel", { bubbles: true, composed: true })
        );
        this.close();
      }
    };
    // use pointerdown so it feels instant
    window.addEventListener("pointerdown", this._outside, { capture: true });
    window.addEventListener("keydown", this.onKeyDown, { capture: true });
  }
  private detachOutside() {
    if (this._outside) {
      window.removeEventListener("pointerdown", this._outside, {
        capture: true,
      } as any);
      this._outside = undefined;
    }
    window.removeEventListener("keydown", this.onKeyDown, {
      capture: true,
    } as any);
  }
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.open) {
      this.dispatchEvent(
        new CustomEvent("cancel", { bubbles: true, composed: true })
      );
      this.close();
    } else if (e.key === "Enter") {
      // handled per-input listener already
    }
  };

  render() {
    const isOpen = this.open;
    const v = this._draft ?? this._value;
    const instant = this.instant;
    const pos = this._pos || { top: -9999, left: -9999 };
    const items = this._filtered;
    this.html`
      <style>
        :host {
          display: ${isOpen ? "block" : "none"};
          position: fixed;
          top: ${pos.top}px; left: ${pos.left}px;
          z-index: 10000;
        }
        .popup {
          min-width: 280px;
          max-width: 360px;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-lg);
          background: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
          box-shadow: var(--shadow-xl);
          padding: .5rem;
        }
        .toolbar { display:${instant ? "none" : "flex"}; justify-content: space-between; align-items:center; gap:.5rem; margin-bottom:.5rem; }
        .toolbar .actions { display:flex; gap:.375rem; }
        .btn { border: 1px solid hsl(var(--border)); background: hsl(var(--secondary)); color: inherit; border-radius: var(--radius-md); padding: .25rem .5rem; cursor: pointer; }
        .search { display:flex; align-items:center; gap:.5rem; }
        .search input { width: 100%; padding: .375rem .5rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); background: hsl(var(--card)); color: inherit; }
  .items { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; max-height: 240px; overflow-y: auto; }
        .chip {
          display: inline-flex; align-items: center; gap: .375rem;
          padding: .25rem .5rem; border-radius: 999px;
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          border: 1px solid hsl(var(--border)); cursor: pointer;
        }
        .chip[aria-selected="true"] {
          outline: 2px solid color-mix(in oklab, hsl(var(--primary)) 40%, transparent);
        }
        .chip:hover {
          background: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
        }
        .empty { color: hsl(var(--muted-foreground)); font-size: var(--text-sm); padding: .25rem .375rem; }
      </style>
      <div class="popup" role="dialog" aria-label="Select">
        <div class="toolbar">
          <span style="opacity:.8; font-size: var(--text-sm);">${v ? `Selected: ${this.escape(v)}` : ""}</span>
          <div class="actions">
            <button type="button" class="btn" id="reset" aria-label="Reset">Reset</button>
            <button type="button" class="btn" id="cancel" aria-label="Cancel">Cancel</button>
            <button type="button" class="btn" id="save" aria-label="Save">Save</button>
          </div>
        </div>
        <div class="search"><input id="q" type="text" placeholder="${this.placeholder}" value="${this.escape(this._q)}" /></div>
        <div class="items" role="listbox">
          ${
            items.length
              ? items
                  .map(
                    (s) =>
                      `<button type="button" class="chip" data-val="${this.escapeAttr(
                        s
                      )}" aria-selected="${v === s}">${this.escape(s)}</button>`
                  )
                  .join("")
              : `<div class="empty">No results</div>`
          }
        </div>
      </div>
    `;
  }

  private escape(s: string) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
  private escapeAttr(s: string) {
    return this.escape(s).replaceAll('"', "&quot;");
  }
}
