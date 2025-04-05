export default class MainLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const actions = [
      { icon: "home", label: "Home" },
      { icon: "search", label: "Search" },
      { icon: "bell", label: "Notifications" },
    ];

    const actionButtons = actions
      .map(
        ({ icon, label }) => `
        <y-tooltip text="${label}" position="right">
          <y-button variant="outline" icon-only aria-label="${label}">
            <y-icon icon="${icon}"></y-icon>
          </y-button>
        </y-tooltip>
      `,
      )
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          margin: var(--spacing-xl);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: stretch;
          height: calc(100vh - var(--spacing-xl) * 2);
          gap: var(--spacing-xl);
        }
        main {
          flex: 1;
          padding: var(--spacing-xl);
          border-radius: var(--radius-xl);
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xl);
          background: hsl(var(--secondary));
          border: 1px solid hsl(var(--border));
        }
        ::slotted(*) {
          width: 100%;
          max-width: var(--sm);
        }
        nav {
          width: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: var(--spacing-lg);
        }
        #logo {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          display: flex;
          justify-content: center;
          align-items: center;
          color: hsl(var(--foreground));
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s ease;
        }
        #actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        aside {
          width: 20rem;
          color: white;
          padding: 20px;
          border-radius: var(--radius-xl);
          background: hsl(var(--secondary));
        }
      </style>
      <nav>
        <div id="logo">𝕐</div>
        <div id="actions">${actionButtons}</div>
        <y-tooltip id="settings" text="Settings" position="right">
          <y-button variant="outline" icon-only aria-label="Settings">
            <y-icon icon="settings"></y-icon>
          </y-button>
        </y-tooltip>
      </nav>
      <main>
        <slot></slot>
      </main>
      <aside></aside>
    `;
  }
}
