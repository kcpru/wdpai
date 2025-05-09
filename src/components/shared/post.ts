import { ShadowComponent } from "../../utils/shadow-component";

export default class Post extends ShadowComponent {
  constructor() {
    super();
    this.html`
      <style>
        :host {
          box-sizing: border-box;
          display: block;
          padding: var(--spacing-md);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius-lg);
          border: 1px solid hsl(var(--border));
          width: 100%;
          max-width: var(--sm);
        }

        .header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        #username {
          font-weight: var(--font-semibold);
          color: hsl(var(--foreground));
        }

        #timestamp {
          color: hsl(var(--foreground) / 0.5);
        }

        #content {
          margin-top: var(--spacing-md);
          color: hsl(var(--foreground));
        }

        #actions {
          display: flex;
          margin-top: var(--spacing-md);
        }
      </style>

      <div class="header">
        <y-avatar src="https://picsum.photos/300/300" alt="Avatar image"></y-avatar>
        <div id="username">Username</div>
        <div id="timestamp">- ago</div>
      </div>

      <div id="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>

      <div id="actions">
        ${this.renderAction("heart", "Like", "17.3k")}
        ${this.renderAction("comments", "See comments", "386")}
        ${this.renderAction("share", "Share")}
        ${this.renderAction("bookmark", "Save")}
      </div>
    `;
  }

  connectedCallback() {
    this.renderTimestamp();
  }

  renderAction(icon: string, tooltip: string, label?: string) {
    const labelPart = label ?? "";
    const iconOnly = label ? "" : "icon-only";
    return `
      <y-tooltip text="${tooltip}" position="bottom">
        <y-button variant="ghost" aria-label="${tooltip}" ${iconOnly}>
          <y-icon icon="${icon}" slot="icon"></y-icon>
          ${labelPart}
        </y-button>
      </y-tooltip>
    `;
  }

  renderTimestamp() {
    const timestamp = this.qs<HTMLDivElement>("#timestamp");
    const now = new Date();
    timestamp.textContent = this.timeAgo(now);
  }

  timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const formats: [number, string][] = [
      [31536000, "year"],
      [2592000, "month"],
      [604800, "week"],
      [86400, "day"],
      [3600, "hour"],
      [60, "minute"],
      [1, "second"],
    ];

    for (const [sec, label] of formats) {
      const interval = Math.floor(seconds / sec);
      if (interval >= 1)
        return `${interval} ${label}${interval > 1 ? "s" : ""} ago`;
    }

    return "just now";
  }
}
