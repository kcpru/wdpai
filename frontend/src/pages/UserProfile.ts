import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("user-profile-page")
export default class UserProfile extends ShadowComponent {
  private username: string = "";
  private profile: any = null;
  private posts: any[] = [];
  private me: { id: number | null; role: string | null } = {
    id: null,
    role: null,
  };

  async connectedCallback() {
    this.username = this.extractUsernameFromPath();
    await Promise.all([this.loadMe(), this.loadProfile(), this.loadPosts()]);
    this.render();
  }

  private extractUsernameFromPath(): string {
    // path like "/@username" or "/users/username" (we use /@username)
    const p = location.pathname;
    if (p.startsWith("/@")) return p.slice(2);
    const parts = p.split("/");
    const at = parts.indexOf("users");
    return at >= 0 ? decodeURIComponent(parts[at + 1] || "") : "";
  }

  private async loadMe() {
    try {
      const resp = await fetch(import.meta.env.VITE_API + "/me", {
        credentials: "include",
      });
      if (!resp.ok) return;
      const data = await resp.json();
      this.me.id = Number(data?.id) || null;
      this.me.role = (data?.role as string) || null;
    } catch {}
  }

  private async loadProfile() {
    if (!this.username) return;
    try {
      const resp = await fetch(
        import.meta.env.VITE_API + "/users/" + encodeURIComponent(this.username)
      );
      if (!resp.ok) throw new Error("not_found");
      this.profile = await resp.json();
    } catch {
      this.profile = null;
    }
  }

  private async loadPosts() {
    if (!this.username) return;
    try {
      const resp = await fetch(
        import.meta.env.VITE_API +
          "/users/" +
          encodeURIComponent(this.username) +
          "/posts",
        { credentials: "include" }
      );
      const data = resp.ok ? await resp.json() : { posts: [] };
      this.posts = data.posts || [];
    } catch {
      this.posts = [];
    }
  }

  private escape(s: string) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  private fmtDate(s?: string | null): string {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s);
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        d
      );
    } catch {
      return d.toLocaleDateString();
    }
  }

  private isSelfOrMod(): boolean {
    return (
      (this.profile?.id && this.me.id && this.profile.id === this.me.id) ||
      this.me.role === "admin" ||
      this.me.role === "moderator"
    );
  }

  private renderHeader() {
    if (!this.profile) {
      return `<y-card><div slot="body">User not found.</div></y-card>`;
    }
    return `
      <y-card>
        <div slot="body" style="display:flex; gap: var(--spacing-md); align-items:center;">
          <y-avatar src="${this.profile.avatar || ""}" alt="${this.profile.username}"></y-avatar>
          <div>
            <y-heading level="1">@${this.escape(this.profile.username)}</y-heading>
            <div style="color:hsl(var(--muted-foreground));">Joined ${this.fmtDate(this.profile.created_at)}</div>
          </div>
          <div style="margin-left:auto;">
            ${this.isSelfOrMod() ? `<y-button variant="outline" disabled>Following</y-button>` : ``}
          </div>
        </div>
      </y-card>
    `;
  }

  private renderPosts() {
    if (!this.posts.length) return `<div>No posts yet.</div>`;
    return this.posts
      .map(
        (p: any) => `
          <y-post
            pid="${p.id}"
            text="${this.escape(p.content)}"
            images='${JSON.stringify(p.images || [])}'
            username="${this.escape(p.username || "")}"
            avatar="${p.avatar || ""}"
            created_at="${p.created_at || ""}"
            likes="${p.likes_count ?? 0}"
            bookmarks="${p.bookmarks_count ?? 0}"
            ${p.liked ? "liked" : ""}
            ${p.bookmarked ? "bookmarked" : ""}
            ${
              (p.user_id && this.me.id && p.user_id === this.me.id) ||
              this.me.role === "admin" ||
              this.me.role === "moderator"
                ? "author"
                : ""
            }
          ></y-post>
        `
      )
      .join("");
  }

  render() {
    this.html`
      <style>
        :host { display:block; }
        .wrap { width: 100%; display:flex; flex-direction:column; align-items:center; }
        .inner { width: var(--sm); max-width: 100%; display:grid; gap: var(--spacing-lg); }
      </style>
      <div class="wrap">
        <div class="inner">
          ${this.renderHeader()}
          ${this.renderPosts()}
        </div>
      </div>
    `;
  }
}
