class CardComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: flex;
                flex-direction: column;
                padding: var(--spacing-md);
                box-shadow: var(--shadow-md);
                gap: var(--spacing-md);
                background: hsl(var(--card));
                color: hsl(var(--card-foreground));
                border-radius: var(--radius-xl);
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
        <div class="header">
            <slot name="header"></slot>
        </div>
        <div class="body">
            <slot name="body"></slot>
        </div>
        <div class="footer">
            <slot name="footer"></slot>
        </div>
        `;
    }
}

customElements.define('card-component', CardComponent);

