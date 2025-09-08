import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("search-page")
export default class SearchPage extends ShadowComponent {
  private abortSugg?: AbortController;
  private meId: number | null = null;
  private meRole: string | null = null;

  connectedCallback() {
    this.render();
    this.loadMe();
    this.bindEvents();
  }

  /* ---------- render ---------- */
  private render() {
    this.html`
      <style>
        :host {
          display: block;
          box-sizing: border-box;
        }
        .box { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .inner { width: var(--sm); max-width: 100%; }
        ul.suggestions {
          list-style: none;
          margin: 0.25rem 0 0;
          padding: 0;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-md);
          background: hsl(var(--card));
          max-height: 200px;
          overflow-y: auto;
          box-shadow: var(--shadow-sm);
        }
        ul.suggestions[hidden] {
          display: none;
        }
        ul.suggestions li {
          padding: var(--spacing-sm) var(--spacing-md);
          cursor: pointer;
        }
        ul.suggestions li:hover,
        ul.suggestions li:focus {
          background: hsl(var(--secondary));
        }
        .results { margin-top: var(--spacing-xl); display: grid; gap: var(--spacing-lg); }
        .users { display: grid; gap: var(--spacing-sm); }
        .user { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm); border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); background: hsl(var(--card)); cursor: pointer; }
        .user:hover { background: hsl(var(--secondary)); }
        .user strong { color: hsl(var(--foreground)); }
      </style>

      <div class="box">
        <div class="inner">
          <y-field id="q" type="text" placeholder="Search users and posts">
            <y-icon slot="start-element" icon="search"></y-icon>
          </y-field>
          <ul class="suggestions" id="sugg" hidden></ul>
          <div class="results" id="res"></div>
        </div>
      </div>
    `;
  }

  /* ---------- events ---------- */
  private bindEvents() {
    this.on("#q", "input", () => this.handleInput());
    this.on("#q", "keydown", (e) => {
      if (e.key === "Enter") this.search(this.getQuery());
    });
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

  private async handleInput() {
    const q = this.getQuery();
    if (!q) return this.hideSuggestions();
    // Minimal suggestions: pokaż tylko aktualny termin jako klikany skrót
    this.showSuggestions([q]);
  }

  /* ---------- suggestions ---------- */
  private showSuggestions(list: string[]) {
    const UL = this.qs<HTMLUListElement>("#sugg");
    if (!list.length) return this.hideSuggestions();

    UL.innerHTML = "";
    list.forEach((word) => {
      const li = document.createElement("li");
      li.textContent = word;
      li.tabIndex = 0;
      li.addEventListener("click", () => this.search(word));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.search(word);
      });
      UL.appendChild(li);
    });
    UL.hidden = false;
  }

  private hideSuggestions() {
    const UL = this.qs<HTMLUListElement>("#sugg");
    UL.hidden = true;
    UL.innerHTML = "";
  }

  /* ---------- search ---------- */
  private async search(q: string) {
    const term = q.trim();
    if (!term) return;

    // sync UI field value
    const field = this.qs<HTMLElement>("#q") as any;
    const input = field?.shadowRoot?.querySelector(
      "input"
    ) as HTMLInputElement | null;
    if (input) input.value = term;
    this.hideSuggestions();

    const resBox = this.qs<HTMLDivElement>("#res");
    resBox.textContent = "Loading…";

    try {
      const [usersRes, postsRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API}/search/users?q=${encodeURIComponent(term)}`,
          { credentials: "include" }
        ),
        fetch(
          `${import.meta.env.VITE_API}/search/posts?q=${encodeURIComponent(term)}`,
          { credentials: "include" }
        ),
      ]);
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
      const postsData = postsRes.ok ? await postsRes.json() : { posts: [] };
      const users = usersData.users || [];
      const posts = postsData.posts || [];

      resBox.innerHTML = `
        <y-card>
          <div slot="header"><strong>Users</strong></div>
          <div slot="body">
            <div class="users">
              ${users
                .map(
                  (u: any) => `
                    <div class="user" data-user="${u.username}">
                      <y-avatar src="${u.avatar || ""}" alt="${u.username}"></y-avatar>
                      <strong>@${this.escape(u.username)}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        </y-card>
        <div class="posts-sec">
          ${posts
            .map(
              (p: any) => `
                <y-post
                  pid="${p.id}"
                  text="${this.escape(p.content)}"
                  images='${JSON.stringify(p.images || [])}'
                  username="${this.escape(p.username || "")}"
                  avatar="${(p as any).avatar || ""}"
                  created_at="${p.created_at || ""}"
                  likes="${p.likes_count ?? 0}"
                  bookmarks="${p.bookmarks_count ?? 0}"
                  ${p.liked ? "liked" : ""}
                  ${p.bookmarked ? "bookmarked" : ""}
                  ${
                    (p.user_id && this.meId && p.user_id === this.meId) ||
                    this.meRole === "admin" ||
                    this.meRole === "moderator"
                      ? "author"
                      : ""
                  }
                ></y-post>
              `
            )
            .join("")}
        </div>
      `;

      // Wire user clicks to navigate
      this.qsa<HTMLElement>(".user").forEach((el) => {
        el.addEventListener("click", () => {
          const username = el.getAttribute("data-user") || "";
          if (!username) return;
          history.pushState({}, "", `/@${username}`);
          window.dispatchEvent(new PopStateEvent("popstate"));
        });
      });
    } catch {
      resBox.textContent = "Search failed";
    }
  }

  private escape(s: string) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  private getQuery(): string {
    const field = this.qs<HTMLElement>("#q") as any;
    const input = field?.shadowRoot?.querySelector(
      "input"
    ) as HTMLInputElement | null;
    return (input?.value || "").trim();
  }
}
