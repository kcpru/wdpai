import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";
import { toaster } from "../utils/toaster";

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
      <div style="display:flex; gap: var(--spacing-md); align-items:center;">
        <y-avatar style="--avatar-size: 8rem;" src="${this.profile.avatar || ""}" alt="${this.profile.username}"></y-avatar>
        <div>
          <y-heading level="1">@${this.escape(this.profile.username)} ${this.profile.vibe ? `<span title="vibe">${this.profile.vibe}</span>` : ``}</y-heading>
          <div style="color:hsl(var(--muted-foreground));">Joined ${this.fmtDate(this.profile.created_at)}</div>
          ${
            this.isSelfOrMod() && this.me.id === this.profile.id
              ? `
            <div style="display:flex; align-items:center; gap:.5rem; margin-top:.5rem;">
              <y-button id="open-vibe" variant="outline">Your vibe</y-button>
              <y-emoji-picker id="picker" instant></y-emoji-picker>
            </div>
          `
              : ``
          }
        </div>
            <div style="margin-left:auto; display:flex; align-items:center; gap:.5rem; flex-wrap: wrap; justify-content:flex-end;">
          ${
            this.me.id && this.profile?.id && this.profile.id !== this.me.id
              ? `<y-button id="follow-btn" variant="outline">${this.profile.following ? "Unfollow" : "Follow"}</y-button>`
              : ``
          }
              ${typeof this.profile.followers_count === "number" ? `<span style="color:hsl(var(--muted-foreground)); font-size: var(--text-sm);"><strong>${this.profile.followers_count}</strong> followers</span>` : ``}
        </div>
      </div>
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
            vibe="${(p as any).vibe || ""}"
            location="${(p as any).location || ""}"
            avatar="${p.avatar || ""}"
            created_at="${p.created_at || ""}"
            likes="${p.likes_count ?? 0}"
            comments="${p.comments_count ?? 0}"
            bookmarks="${p.bookmarks_count ?? 0}"
            ${this.me.id ? "can_interact" : ""}
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
        .inner { max-width: 100%; display:grid; gap: var(--spacing-lg); }
      </style>
      <div class="wrap">
        <div class="inner">
          ${this.renderHeader()}
          ${this.renderPosts()}
        </div>
      </div>
    `;
    // Vibe pick/save for self
    const openVibe = this.root.querySelector(
      "#open-vibe"
    ) as HTMLElement | null;
    const picker = this.root.querySelector("#picker") as any;
    if (picker && this.profile && this.me.id === this.profile.id) {
      picker.value = this.profile.vibe || null;
      picker.open = false;
      const open = () => picker.openAt(openVibe!);
      openVibe?.addEventListener("click", open);
      (openVibe as any)?.addEventListener?.("click-event", open);
      picker.addEventListener("change", (e: any) => {
        const v = e?.detail?.value || null;
        // instantly persist
        (async () => {
          const prev = this.profile.vibe || null;
          this.profile.vibe = v;
          try {
            const resp = await fetch(
              `${import.meta.env.VITE_API}/settings/vibe`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ vibe: v }),
              }
            );
            if (!resp.ok) throw new Error("vibe_fail");
            toaster.create({
              type: "success",
              title: "Vibe updated",
              description: v ? `Set to ${v}` : "Cleared",
            });
            this.render();
          } catch {
            this.profile.vibe = prev;
            toaster.create({ type: "error", title: "Could not update vibe" });
          }
        })();
      });
      picker.addEventListener("cancel", () => {
        // no-op
      });
    }

    const btn = this.root.querySelector("#follow-btn") as HTMLElement | null;
    if (btn) {
      btn.addEventListener("click", async () => {
        if (!this.profile) return;
        // Confirm when unfollowing
        let want = !this.profile.following;
        if (!want) {
          // we are about to unfollow -> confirm using global confirm dialog if available
          const confirmEl = document.querySelector("y-confirm") as any;
          let ok = true;
          if (confirmEl?.open) {
            ok = await confirmEl.open({
              title: "Unfollow user",
              description: `Stop following @${this.profile.username}?`,
              confirmText: "Unfollow",
              cancelText: "Cancel",
            });
          } else {
            ok = window.confirm(`Stop following @${this.profile.username}?`);
          }
          if (!ok) return;
        }
        // optimistic
        this.profile.following = want;
        (btn as any).textContent = want ? "Unfollow" : "Follow";
        // update followers count optimistic
        if (typeof this.profile.followers_count === "number") {
          this.profile.followers_count += want ? 1 : -1;
          this.render();
        }
        try {
          await fetch(
            `${import.meta.env.VITE_API}/users/${encodeURIComponent(this.profile.username)}/follow`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ follow: want }),
            }
          );
          if (want) {
            toaster.create({
              type: "success",
              title: "Following",
              description: `You are now following @${this.profile.username}.`,
            });
          }
        } catch {
          // rollback on failure
          this.profile.following = !want;
          (btn as any).textContent = this.profile.following
            ? "Unfollow"
            : "Follow";
          if (typeof this.profile.followers_count === "number") {
            this.profile.followers_count += want ? -1 : 1;
            this.render();
          }
        }
      });
    }
  }
}
