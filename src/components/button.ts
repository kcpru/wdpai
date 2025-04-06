export default class ButtonComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { }

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--spacing-sm);
          border-radius: var(--radius-md);
          cursor: pointer;
          outline: none;
          font-family: inherit;
          height: 2rem;
          border: 1px solid transparent;
          transition: 0.15s ease;
          white-space: nowrap;
        }
        
        :host(:not(:has(y-icon))) button {
          padding: 0 var(--spacing-xl);
        }
        
        :host(:not([icon-only])) ::slotted(y-icon) {
          margin-right: var(--spacing-sm);
        }
        
        :host([icon-only]) slot:not([name="icon"]) {
            display: none;
        }

        button.primary {
          background-color: hsl(var(--secondary-foreground));
          color: hsl(var(--secondary));
        }

        button.secondary {
          background-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
        }

        button.outline {
          background-color: hsl(var(--background));
          color: hsl(var(--secondary-foreground));
          border: 1px solid hsl(var(--border));
        }
        
        button:not([disabled]).outline:hover {
          background-color: hsl(var(--secondary));
        }

        button.ghost {
          background-color: transparent;
          color: hsl(var(--secondary-foreground));
        }

        button:not([disabled]).ghost:hover {
          background-color: hsl(var(--secondary));
          border: 1px solid hsl(var(--border));
        }

        button.icon-only {
          aspect-ratio: 1/1;
          padding: 0;
        }

        button:focus-visible {
          box-shadow: var(--shadow-outline);
        }

        button:disabled {
          opacity: 0.6;
          /*background-color: hsl(var(--muted));*/
          /*color: hsl(var(--muted-foreground));*/
          cursor: not-allowed;
        }
      </style>
      <button class="primary">
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }

  static get observedAttributes() {
    return ["variant", "disabled", "icon-only"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const button = this.shadowRoot.querySelector("button");
    const tooltip = this.shadowRoot.querySelector("#tooltip");

    if (name === "variant") {
      button.className = newValue;
    } else if (name === "disabled") {
      newValue !== null
        ? button.setAttribute("disabled", "")
        : button.removeAttribute("disabled");
    } else if (name === "icon-only") {
      newValue !== null
        ? button.classList.add("icon-only")
        : button.classList.remove("icon-only");
    }
  }
}
