import { WC_PREFIX } from "../constants/config";
import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("home-page")
export default class Home extends ShadowComponent {
  private posts: Array<{
    id: number;
    content: string;
    images: string[];
    user_id?: number;
    username?: string;
    created_at?: string;
    likes_count?: number;
    liked?: boolean;
    bookmarked?: boolean;
    bookmarks_count?: number;
  }> = [];
  private meId: number | null = null;
  private meRole: string | null = null;

  async connectedCallback() {
    await Promise.all([this.loadMe(), this.loadPosts()]);
    this.render();
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      this.posts.unshift(detail);
      this.render();
    };
    this.root.addEventListener("post-created", onCreated as any);

    const onDeleted = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (typeof id !== "number") return;
      this.posts = this.posts.filter((p) => p.id !== id);
      this.render();
    };
    this.root.addEventListener("post-deleted", onDeleted as any);
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
    } catch {
      this.meId = null;
    }
  }

  private async loadPosts() {
    try {
      const endpoint = this.meId ? "/feed" : "/posts";
      const resp = await fetch(import.meta.env.VITE_API + endpoint, {
        credentials: "include",
      });
      if (!resp.ok) throw new Error("failed");
      const data = await resp.json();
      this.posts = data.posts || [];
    } catch {
      this.posts = [];
    }
  }

  private render() {
    this.html`
      <style>
        :host { display:block; width:100%; }
  .container { width: min(100%, var(--sm)); display:flex; flex-direction:column; align-items:center; gap: var(--spacing-md); margin-bottom: calc(2 * var(--spacing-xl)); }
      </style>
      <div class="container">
        <y-create-post-gate></y-create-post-gate>

        ${this.posts
          .map(
            (p) =>
              `<y-post
                pid="${p.id}"
                text="${this.escape(p.content)}"
                images='${JSON.stringify(p.images || [])}'
                username="${this.escape(p.username || "")}"
                avatar="${(p as any).avatar || ""}"
                created_at="${p.created_at || ""}"
                likes="${p.likes_count ?? 0}"
                comments="${(p as any).comments_count ?? 0}"
                bookmarks="${p.bookmarks_count ?? 0}"
                ${this.meId ? "can_interact" : ""}
                ${p.liked ? "liked" : ""}
                ${p.bookmarked ? "bookmarked" : ""}
                ${
                  (p.user_id && this.meId && p.user_id === this.meId) ||
                  this.meRole === "admin" ||
                  this.meRole === "moderator"
                    ? "author"
                    : ""
                }
              ></y-post>`
          )
          .join("")}
      </div>
    `;
  }

  private escape(s: string) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}
