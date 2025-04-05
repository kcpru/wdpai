export default class MainLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const actions = [
      { icon: "home", label: "Home" },
      { icon: "search", label: "Search" },
      { icon: "bell", label: "Notifications" },
      { icon: "bookmark", label: "Bookmarks" },
      { icon: "stars", label: "Mrok AI" },
      { icon: "settings", label: "Settings" },
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
          position: relative;
          display: flex;
          width: 100%;
          background: hsl(var(--secondary));
          border-radius: var(--radius-xl);
          border: 1px solid hsl(var(--border));
          overflow: hidden;
        }
        #content {
          padding: var(--spacing-xl);
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xl);
          align-self: stretch;
        }
        ::slotted(*) {
          width: 100%;
          max-width: var(--sm);
        }
        #back-to-top {
          position: absolute;
          bottom: var(--spacing-xl);
          left: 50%;
          z-index: 9999;
          transform: translateY(200%) translateX(-50%);
          transition: transform 0.2s ease;
        }
        #back-to-top.show {
          transform: translateY(0) translateX(-50%);
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
        
        <y-tooltip id="panel" text="Expand panel" position="right">
          <y-button variant="outline" icon-only aria-label="Expand panel">
            <y-icon icon="left-panel-open"></y-icon>
          </y-button>
        </y-tooltip>
      </nav>
      
      <main>
        <div id="content">
          <slot></slot>
        </div>  
        
        <y-tooltip id="back-to-top" text="Back to top">
          <y-button variant="outline" icon-only aria-label="Back to top">
            <y-icon icon="arrow-upward"></y-icon>
          </y-button>
        </y-tooltip>
      </main>
      
      <aside></aside>
    `;
  }

  addEventListeners() {
    const content = this.shadowRoot.getElementById("content");
    const backToTopButton = this.shadowRoot.querySelector("#back-to-top");
    backToTopButton.addEventListener("click", () => {
      content.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    content.addEventListener("scroll", () => {
      if (content.scrollTop > 0) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    });
  }
}
