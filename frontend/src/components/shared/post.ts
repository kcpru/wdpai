import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";

@WC("post")
export default class Post extends ShadowComponent {
  static get observedAttributes() {
    return [
      "pid",
      "text",
      "images",
      "author",
      "username",
      "likes",
      "liked",
      "bookmarked",
      "bookmarks",
      "avatar",
      "created_at",
    ];
  }

  postId?: number;
  text = "";
  images: string[] = [];
  author = false;
  username = "";
  avatar = "";
  likes = 0;
  liked = false;
  bookmarked = false;
  bookmarks = 0;

  createdAt?: string;

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
    const idAttr = this.attr("pid");
    this.postId = idAttr ? Number(idAttr) : undefined;
    this.text = this.attr("text") ?? "";
    try {
      this.images = JSON.parse(this.attr("images") ?? "[]");
    } catch {
      this.images = [];
    }
    this.author = this.hasAttr("author");
    this.username = this.attr("username") ?? "";
    this.avatar = this.attr("avatar") ?? "";
    this.likes = Number(this.attr("likes") || 0) || 0;
    this.liked = this.hasAttr("liked");
    this.bookmarked = this.hasAttr("bookmarked");
    this.bookmarks = Number(this.attr("bookmarks") || 0) || 0;
    this.createdAt = this.attr("created_at") || undefined;
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
  <y-avatar src="${this.avatar || ""}" alt="Avatar image"></y-avatar>
  <div id="username">${this.username || ""}</div>
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
        ${this.renderAction("heart", this.liked ? "Unlike" : "Like", String(this.likes))}
        ${this.renderAction("comments", "See comments", "386")}
        ${this.renderAction("share", "Share")}
        ${this.renderAction("bookmark", this.bookmarked ? "Saved" : "Save", String(this.bookmarks))}
        <div style="flex-grow:1"></div>
        ${this.author ? this.renderAction("trash", "Delete") : ""}
      </div>

  <y-confirm id="confirm"></y-confirm>
    `;

    // Wire delete when author and id is present
    if (this.author && this.postId) {
      const actions = this.root.querySelectorAll("#actions y-button");
      const last = actions[actions.length - 1] as HTMLElement | undefined;
      last?.addEventListener("click-event" as any, () =>
        this.confirmAndDelete()
      );
    }

    // Wire like/share/bookmark
    const actions = this.root.querySelectorAll("#actions y-button");
    const [likeBtn, , shareBtn, bookmarkBtn] = Array.from(
      actions
    ) as HTMLElement[];
    likeBtn?.addEventListener("click-event" as any, () => this.toggleLike());
    shareBtn?.addEventListener("click-event" as any, () => this.share());
    bookmarkBtn?.addEventListener("click-event" as any, () =>
      this.toggleBookmark()
    );
  }

  private async confirmAndDelete() {
    if (!this.postId) return;
    const confirmEl = this.qs("#confirm") as any;
    const ok = await confirmEl?.open?.({
      title: "Delete post",
      description: "Delete this post? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;
    await this.deleteSelf();
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

  async deleteSelf() {
    if (!this.postId) return;
    try {
      const resp = await fetch(
        import.meta.env.VITE_API + "/posts/" + this.postId,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!(resp.ok || resp.status === 204)) throw new Error("delete_failed");
      // Optimistically remove from DOM
      this.remove();
      this.dispatchEvent(
        new CustomEvent("post-deleted", {
          detail: { id: this.postId },
          bubbles: true,
          composed: true,
        })
      );
    } catch {
      // Optionally show a toast if available via event or global
    }
  }

  async toggleLike() {
    if (!this.postId) return;
    const next = !this.liked;
    // optimistic UI
    this.liked = next;
    this.likes += next ? 1 : -1;
    this.render();
    try {
      const resp = await fetch(
        import.meta.env.VITE_API + "/posts/" + this.postId + "/like",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ like: next }),
        }
      );
      if (!resp.ok) throw new Error("like_failed");
      const data = await resp.json();
      // sync from server just in case
      this.likes = Number(data?.likes_count ?? this.likes);
      this.liked = Boolean(data?.liked ?? next);
      this.render();
    } catch {
      // rollback on error
      this.liked = !next;
      this.likes += next ? -1 : 1;
      this.render();
    }
  }

  async toggleBookmark() {
    if (!this.postId) return;
    const next = !this.bookmarked;
    this.bookmarked = next;
    this.bookmarks += next ? 1 : -1;
    this.render();
    try {
      const resp = await fetch(
        import.meta.env.VITE_API + "/posts/" + this.postId + "/bookmark",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ bookmark: next }),
        }
      );
      if (!resp.ok) throw new Error("bookmark_failed");
    } catch {
      this.bookmarked = !next; // rollback
      this.bookmarks += next ? -1 : 1;
      this.render();
    }
  }

  async share() {
    try {
      const url =
        location.origin + location.pathname + "#post-" + (this.postId ?? "");
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      // optionally: toast success
    } catch {
      // ignore
    }
  }

  renderTimestamp() {
    const timestamp = this.qs<HTMLDivElement>("#timestamp");
    const date = this.createdAt ? new Date(this.createdAt) : new Date();
    timestamp.textContent = this.timeAgo(date);
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
