import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("bookmarks-page")
export default class BookmarksPage extends ShadowComponent {
  private posts: Array<any> = [];
  private meId: number | null = null;
  private meRole: string | null = null;

  async connectedCallback() {
    await Promise.all([this.loadMe(), this.load()]);
    this.render();
  }

  private async loadMe() {
    try {
      const resp = await fetch(import.meta.env.VITE_API + "/me", {
        credentials: "include",
      });
      if (!resp.ok) return;
      const me = await resp.json();
      this.meId = Number(me?.id) || null;
      this.meRole = (me?.role as string) || null;
    } catch {}
  }

  private async load() {
    try {
      const resp = await fetch(import.meta.env.VITE_API + "/bookmarks", {
        credentials: "include",
      });
      if (!resp.ok) throw new Error("unauthorized");
      const data = await resp.json();
      this.posts = Array.isArray(data.posts) ? data.posts : [];
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

  private render() {
    this.html`
      <style>
        :host { display:block; width:100%; }
  .container { width: min(100%, var(--sm)); display:flex; flex-direction:column; align-items:center; gap: var(--spacing-md); }
      </style>
      <div class="container">
        <h2>Bookmarks</h2>
        ${this.posts
          .map(
            (p: any) => `
              <y-post
                pid="${p.id}"
                text="${this.escape(p.content)}"
                images='${JSON.stringify(p.images || [])}'
                username="${this.escape(p.username || "")}" 
                vibe="${p.vibe || ""}"
                location="${p.location || ""}"
                avatar="${p.avatar || ""}"
                ${
                  (p.user_id && this.meId && p.user_id === this.meId) ||
                  this.meRole === "admin" ||
                  this.meRole === "moderator"
                    ? "author"
                    : ""
                }
                likes="${p.likes_count ?? 0}"
                comments="${p.comments_count ?? 0}"
                bookmarks="${p.bookmarks_count ?? 0}"
                ${this.meId ? "can_interact" : ""}
                ${p.liked ? "liked" : ""}
                ${p.bookmarked ? "bookmarked" : ""}
              ></y-post>`
          )
          .join("")}
      </div>
    `;
  }
}
