export default class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: var(--spacing-md);
          gap: var(--spacing-md);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius-lg);
          border: 1px solid hsl(var(--border));
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-md);
        }
        .footer > * {
          margin: 0;
        }
        .footer > :first-child {
          margin-right: auto;
        }
        .footer > :last-child {
          margin-left: auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header > * {
          margin: 0;
        }
     </style>
    <slot name="header"></slot>
    <slot name="body"></slot>
    <slot name="footer"></slot>
    `;
  }
}
