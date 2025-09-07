import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";
import { render } from "../router/index";

@WC("page-notifications")
export default class NotificationsPage extends ShadowComponent {
  private items: any[] = [];
  private loading = true;
  private error: string | null = null;

  async connectedCallback() {
    this.render();
    await this.load();
    this.render();
    this.attach();
  }

  private async load() {
    try {
      this.loading = true;
      this.error = null;
      const res = await fetch(import.meta.env.VITE_API + "/notifications", {
        credentials: "include",
      });
      if (res.status === 401) {
        history.pushState({}, "", "/login");
        render(location.pathname);
        return;
      }
      const data = await res.json();
      this.items = data.notifications || [];
      // mark as read (fire and forget)
      fetch(import.meta.env.VITE_API + "/notifications/read", {
        method: "POST",
        credentials: "include",
      });
    } catch (e: any) {
      this.error = "Failed to load notifications";
    } finally {
      this.loading = false;
    }
  }

  private fmtTime(ts: string) {
    const d = new Date(ts);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  }

  render() {
    const content = this.loading
      ? `<div class="state">Loading…</div>`
      : this.error
        ? `<div class="state error">${this.error}</div>`
        : this.items.length === 0
          ? `<div class="state">No notifications yet.</div>`
          : this.items
              .map((n) => {
                if (n.type === "like") {
                  return `
              <y-card class="item">
                <div class="row">
                  <y-avatar src="${n.actor_avatar || ""}"></y-avatar>
                  <div class="meta">
                    <div class="line">
                      <strong>@${n.actor_username}</strong> liked your post
                    </div>
                    <div class="time">${this.fmtTime(n.created_at)}</div>
                  </div>
                </div>
                ${n.post_content ? `<div class="post">“${n.post_content.slice(0, 140)}${n.post_content.length > 140 ? "…" : ""}”</div>` : ""}
              </y-card>`;
                }
                return "";
              })
              .join("");

    this.html`
      <style>
        :host { display: block; width: 100%; }
        .container { width: min(100%, var(--sm)); display: flex; flex-direction: column; gap: var(--spacing-md); }
        header { display: flex; align-items: center; justify-content: space-between; }
        h1 { font-size: var(--text-2xl); margin: 0; }
        .state { color: hsl(var(--muted-foreground)); padding: var(--spacing-xl) 0; text-align: center; }
        .state.error { color: hsl(var(--destructive-foreground)); }
        .item { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .row { display: flex; gap: var(--spacing-md); align-items: center; }
        y-avatar { width: 40px; height: 40px; border-radius: 999px; overflow: hidden; }
        .meta { display: flex; flex-direction: column; gap: 2px; }
        .time { color: hsl(var(--muted-foreground)); font-size: var(--text-sm); }
        .post { color: hsl(var(--muted-foreground)); font-style: italic; }
      </style>

      <div class="container">
        <header>
          <h1>Notifications</h1>
        </header>
        ${content}
      </div>
    `;
  }

  private attach() {}
}
