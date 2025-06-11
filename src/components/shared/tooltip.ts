import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("tooltip")
export default class Tooltip extends ShadowComponent {
  constructor() {
    super();

    this.html`
      <style>
        :host {
          position: relative;
          display: inline-block;
        }

        #tooltip {
          user-select: none;
          pointer-events: none;
          position: absolute;
          background-color: hsl(var(--background) / 0.5);
          backdrop-filter: blur(var(--backdrop-blur));
          color: hsl(var(--foreground));
          font-size: var(--text-xs);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid hsl(var(--secondary));
          white-space: nowrap;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: 0.1s cubic-bezier(0.3, 0, 1, 0) 0s;
        }

        :host(:hover) #tooltip {
          opacity: 1;
          visibility: visible;
          transition: 0.1s cubic-bezier(0, 0.3, 0, 1) 0.5s;
        }
        
        .top {
          bottom: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%) translateY(var(--spacing-sm));
        }
        
        :host(:hover) .top {
          transform: translateX(-50%) translateY(0);
        }
        
        .bottom {
          top: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%) translateY(calc(var(--spacing-sm) * -1));
        }
        
        :host(:hover) .bottom {
          transform: translateX(-50%) translateY(0);
        }

        .left {
          right: calc(100% + 0.5rem);
          top: 50%;
          transform: translateY(-50%) translateX(var(--spacing-sm));
        }
        
        :host(:hover) .left {
          transform: translateY(-50%) translateX(0);
        }

        .right {
          left: calc(100% + 0.5rem);
          top: 50%;
          transform: translateY(-50%) translateX(calc(var(--spacing-sm) * -1));
        }
        
        :host(:hover) .right {
          transform: translateY(-50%) translateX(0);
        }
      </style>
      <slot></slot>
      <span id="tooltip" class="top"></span>
    `;
  }

  static get observedAttributes() {
    return ["text", "position"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const tooltip = this.qs<HTMLDivElement>("#tooltip");
    if (name === "text") {
      tooltip.textContent = newValue || "";
      tooltip.style.display = newValue ? "inline" : "none";
    } else if (name === "position") {
      tooltip.classList.remove("top", "bottom", "left", "right");
      tooltip.classList.add(newValue || "top");
    }
  }
}
