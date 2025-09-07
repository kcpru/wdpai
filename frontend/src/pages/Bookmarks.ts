import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("bookmarks-page")
export default class BookmarksPage extends ShadowComponent {
  private posts: Array<any> = [];

  async connectedCallback() {
    await this.load();
    this.render();
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
    return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  private render() {
    this.html`
      <style>
        :host { display: flex; flex-direction: column; gap: var(--spacing-md); }
      </style>
      <h2>Bookmarks</h2>
      ${this.posts
        .map(
          (p: any) => `
            <y-post
              pid="${p.id}"
              text="${this.escape(p.content)}"
              images='${JSON.stringify(p.images || [])}'
              username="${this.escape(p.username || "")}"
              avatar="${p.avatar || "" }"
              created_at="${p.created_at || ""}"
              likes="${p.likes_count ?? 0}"
              bookmarks="${p.bookmarks_count ?? 0}"
              ${p.liked ? "liked" : ""}
              ${p.bookmarked ? "bookmarked" : ""}
              ${p.user_id && p.meId && p.user_id === p.meId ? "author" : ""}
            ></y-post>`
        )
        .join("")}
    `;
  }
}
