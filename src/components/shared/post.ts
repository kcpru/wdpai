import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("post")
export default class Post extends ShadowComponent {
  static observedAttributes = ["text", "images"];

  text = "";
  images: string[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.renderTimestamp();
  }

  attributeChangedCallback() {
    this.parseAttributes();
    this.render();
  }

  parseAttributes() {
    this.text = this.attr("text") ?? "";
    try {
      this.images = JSON.parse(this.attr("images") ?? "[]");
    } catch {
      this.images = [];
    }
  }

  render() {
    this.html`
      <style>
        :host {
          display: block;
          padding: var(--spacing-md);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius-lg);
          border: 1px solid hsl(var(--border));
          max-width: var(--sm);
          box-sizing: border-box;
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
        }

        #images {
          margin-top: var(--spacing-md);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
          gap: var(--spacing-sm);
        }

        #images img {
          width: 100%;
          border-radius: var(--radius-md);
          object-fit: cover;
        }

        #actions {
          display: flex;
          margin-top: var(--spacing-md);
        }
      </style>

      <div class="header">
        <y-avatar src="https://picsum.photos/300/300" alt="Avatar image"></y-avatar>
        <div id="username">Username</div>
        <div id="timestamp">–</div>
      </div>

      <div id="content">${this.text}</div>

			<div id="images">
				${this.images
          .map(
            (src) =>
              `<y-image src="${encodeURI(src)}" alt="Post image"></y-image>`
          )
          .join("")}
			</div>

      <div id="actions">
        ${this.renderAction("heart", "Like", "17.3k")}
        ${this.renderAction("comments", "See comments", "386")}
        ${this.renderAction("share", "Share")}
        ${this.renderAction("bookmark", "Save")}
      </div>
    `;
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
    timestamp.textContent = this.timeAgo(new Date());
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
