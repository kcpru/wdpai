import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("toggle-tip")
export default class ToggleTip extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        :host {
          position: relative;
          display: inline-block;
        }

        #tooltip {
          position: absolute;
          background-color: #333;
          color: #fff;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
          z-index: 1;
          opacity: 0;
          visibility: hidden;
          /*transition: opacity 0.15s ease, transform 0.15s ease;*/
        }

        .top {
          bottom: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%) translateY(10%);
        }

        .bottom {
          top: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%) translateY(-10%);
        }

        .left {
          right: calc(100% + 0.5rem);
          top: 50%;
          transform: translateY(-50%) translateX(-10%);
        }

        .right {
          left: calc(100% + 0.5rem);
          top: 50%;
          transform: translateY(-50%) translateX(10%);
        }

        .visible {
          opacity: 1;
          visibility: visible;
          transform: translate(0, 0);
        }
      </style>
      <slot></slot>
      <span id="tooltip" class="top"></span>
    `;
  }

  connectedCallback() {
    this.qs<HTMLSlotElement>("slot")?.addEventListener("click", () => {
      console.log("clicked");
      const tooltip = this.root.querySelector("#tooltip");
      tooltip?.classList.toggle("visible");
    });

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target as Node)) {
        console.log("document clicked");
        // this.root.querySelector("#tooltip")?.classList.remove("visible");
      }
    });
  }

  static get observedAttributes() {
    return ["text", "position"];
  }

  attributeChangedCallback(name: string, _old: string, value: string) {
    const tooltip = this.root.querySelector("#tooltip") as HTMLElement;
    if (!tooltip) return;

    if (name === "text") {
      tooltip.textContent = value || "";
      tooltip.style.display = value ? "inline" : "none";
    }

    if (name === "position") {
      tooltip.classList.remove("top", "bottom", "left", "right");
      tooltip.classList.add(value || "top");
    }
  }
}
