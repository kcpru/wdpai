import { ShadowComponent } from "../../utils/shadow-component";
import { WC } from "../../utils/wc";
import { render } from "../../router/index";

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
      "comments",
      "can_interact",
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
  comments = 0;
  showComments = false;
  commentsList: Array<any> = [];
  loadingComments = false;
  canInteract = false;

  createdAt?: string;

  constructor() {
    super();
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.renderTimestamp();
    this.attachUsernameHandlers();
  }

  attributeChangedCallback() {
    this.parseAttributes();
    this.render();
    this.attachUsernameHandlers();
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
    this.comments = Number(this.attr("comments") || 0) || 0;
    this.canInteract = this.hasAttr("can_interact");
    this.createdAt = this.attr("created_at") || undefined;
  }

  render() {
    this.html`
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: var(--spacing-md);
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius-lg);
          border: 1px solid hsl(var(--border));
          box-sizing: border-box;
        }

        .header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

  #username { font-weight: var(--font-semibold); }
  #username, #username a { color: hsl(var(--foreground)); text-decoration: none; }
  #username a:hover { text-decoration: underline; }

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

        .comments {
          margin-top: var(--spacing-md);
          border-top: 1px solid hsl(var(--border));
          padding-top: var(--spacing-md);
          display: grid;
          gap: var(--spacing-md);
        }
        .comment {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: var(--spacing-sm);
        }
        .comment .meta { color: hsl(var(--muted-foreground)); font-size: var(--text-sm); }
        .comment .bubble { background: hsl(var(--muted)); border-radius: var(--radius-md); padding: var(--spacing-sm) var(--spacing-md); }
        .comment-form { display:flex; align-items:center; gap: var(--spacing-sm); }
        .comment-form y-field { flex: 1; }
      </style>

    <div class="header">
  <y-avatar src="${this.avatar || ""}" alt="Avatar image"></y-avatar>
  <div id="username"><a href="/@${encodeURIComponent(this.username || "")}" data-user="${this.escape(this.username)}">@${this.escape(this.username)}</a></div>
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
        ${this.renderAction("comments", this.showComments ? "Hide comments" : "Show comments", String(this.comments))}
        ${this.renderAction("share", "Share")}
        ${this.renderAction("bookmark", this.bookmarked ? "Saved" : "Save", String(this.bookmarks))}
        <div style="flex-grow:1"></div>
        ${this.author ? this.renderAction("trash", "Delete") : ""}
      </div>

  <y-confirm id="confirm"></y-confirm>

      ${
        this.showComments
          ? `
        <div class="comments" id="comments">
          <div id="comment-list">
            ${this.commentsList
              .map(
                (c) => `
                <div class="comment">
                  <y-avatar src="${c.avatar || ""}" alt="${c.username}"></y-avatar>
                  <div>
                    <div class="meta"><a class="user-link" href="/@${encodeURIComponent(c.username || "")}" data-user="${this.escape(c.username)}">@${this.escape(c.username)}</a> • ${this.timeAgo(new Date(c.created_at))}</div>
                    <div class="bubble">${this.escape(c.content)}</div>
                  </div>
                </div>
              `
              )
              .join("")}
            ${this.loadingComments ? `<div>Loading…</div>` : ``}
          </div>

          ${
            this.canInteract
              ? `
          <div class="comment-form">
            <y-field id="cfield" placeholder="Napisz komentarz…"></y-field>
            <y-button id="csend" variant="outline" icon-only aria-label="Send">
              <y-icon icon="arrow-upward" slot="icon"></y-icon>
            </y-button>
          </div>
          `
              : ``
          }
        </div>
        `
          : ``
      }
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
    const [likeBtn, commentsBtn, shareBtn, bookmarkBtn] = Array.from(
      actions
    ) as HTMLElement[];
    likeBtn?.addEventListener("click-event" as any, () => this.toggleLike());
    if (likeBtn) {
      if (!this.canInteract) likeBtn.setAttribute("disabled", "");
      else likeBtn.removeAttribute("disabled");
    }
    commentsBtn?.addEventListener("click-event" as any, () =>
      this.toggleComments()
    );
    shareBtn?.addEventListener("click-event" as any, () => this.share());
    bookmarkBtn?.addEventListener("click-event" as any, () =>
      this.toggleBookmark()
    );

    if (this.showComments && this.canInteract) {
      const send = this.qs<HTMLElement>("#csend");
      send?.addEventListener("click-event" as any, () => this.sendComment());
      const field = this.qs<HTMLElement>("#cfield") as any;
      const input = field?.shadowRoot?.querySelector(
        "input"
      ) as HTMLInputElement;
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.sendComment();
      });
    }

    // Attach username/profile link handlers inside current DOM
    this.attachUsernameHandlers();
  }

  private attachUsernameHandlers() {
    // Header username link
    const u = this.root.querySelector(
      '#username a[href^="/@"]'
    ) as HTMLAnchorElement | null;
    if (u) {
      u.addEventListener("click", (e) => {
        e.preventDefault();
        const href = u.getAttribute("href") || "/";
        history.pushState({}, "", href);
        render(location.pathname);
      });
    }
    // Comment username links
    this.root.querySelectorAll(".comment .meta a.user-link").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (a as HTMLAnchorElement).getAttribute("href") || "/";
        history.pushState({}, "", href);
        render(location.pathname);
      });
    });
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
    if (!this.canInteract) return;
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

  async toggleComments() {
    if (!this.postId) return;
    this.showComments = !this.showComments;
    this.render();
    if (this.showComments && this.commentsList.length === 0) {
      await this.loadComments();
    }
  }

  async loadComments() {
    if (!this.postId) return;
    this.loadingComments = true;
    this.render();
    try {
      const resp = await fetch(
        import.meta.env.VITE_API + `/posts/${this.postId}/comments`,
        { credentials: "include" }
      );
      const data = resp.ok ? await resp.json() : { comments: [] };
      this.commentsList = data.comments || [];
    } catch {
      this.commentsList = [];
    } finally {
      this.loadingComments = false;
      this.render();
    }
  }

  async sendComment() {
    if (!this.postId) return;
    const field = this.qs<HTMLElement>("#cfield") as any;
    const input = field?.shadowRoot?.querySelector("input") as HTMLInputElement;
    const text = (input?.value || "").trim();
    if (!text) return;
    // optimistic append
    const now = new Date().toISOString();
    const optimistic = {
      id: Math.random(),
      post_id: this.postId,
      content: text,
      created_at: now,
      username: "You",
      avatar: "",
    };
    this.commentsList.push(optimistic);
    this.comments += 1;
    this.render();
    input.value = "";
    try {
      const resp = await fetch(
        import.meta.env.VITE_API + `/posts/${this.postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: text }),
        }
      );
      if (!resp.ok) throw new Error("comment_failed");
      const data = await resp.json();
      // replace last optimistic with real one
      this.commentsList[this.commentsList.length - 1] = data.comment;
      this.render();
    } catch {
      // rollback
      this.commentsList.pop();
      this.comments = Math.max(0, this.comments - 1);
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

  private escape(s: string) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}
