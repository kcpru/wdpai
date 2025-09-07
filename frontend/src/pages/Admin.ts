import { ShadowComponent } from "../utils/shadow-component";
import { WC } from "../utils/wc";

@WC("admin-page")
export default class AdminPage extends ShadowComponent {
  private users: Array<{ id: number; username: string; role: string; avatar?: string | null; created_at?: string }>= [];

  async connectedCallback() {
    await this.load();
    this.render();
  }

  private async load() {
    try {
      const resp = await fetch(import.meta.env.VITE_API + "/admin/users", { credentials: "include" });
      if (!resp.ok) throw new Error("forbidden");
      const data = await resp.json();
      this.users = data.users || [];
    } catch {
      this.users = [];
    }
  }

  private render() {
    this.html`
      <style>
  :host { display: block; }
  .container { width: var(--sm); max-width: 100%; display: grid; gap: var(--spacing-lg); }
  .lede { color: hsl(var(--muted-foreground)); margin: 0; }
  .users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--spacing-md); }
  y-avatar { --avatar-size: 1.75rem; }
  .card-top { display: flex; align-items: center; gap: var(--spacing-sm); min-width: 0; }
  .name { font-weight: var(--font-medium); overflow-wrap: anywhere; word-break: break-word; }
  .meta { display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap; }
  .created { font-size: var(--text-xs); color: hsl(var(--muted-foreground)); flex: 1 1 auto; min-width: 0; }
  .actions { display: inline-flex; gap: var(--spacing-xs); flex: 0 0 auto; }
      </style>
      <div class="container">
        <y-card>
          <div slot="header">
            <y-heading level="1">Admin · Users</y-heading>
            <p class="lede">Manage roles and remove accounts.</p>
          </div>

          <div slot="body" class="users-grid">
            ${this.users.map(u => `
              <y-card class="user-card">
                <div slot="header" class="card-top">
                  ${u.avatar ? `<y-avatar src="${u.avatar}" alt="${u.username}"></y-avatar>` : `<y-avatar></y-avatar>`}
                  <div class="name">@${u.username} <span style="opacity:.6">#${u.id}</span></div>
                </div>
                <div slot="body">
                  <y-select variant="outline" data-id="${u.id}" class="role">
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>user</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                  </y-select>
                </div>
                <div slot="footer" class="meta">
                  <span class="created">${this.fmtDate(u.created_at)}</span>
                  <span class="actions">
                    <y-button data-action="save" data-id="${u.id}" variant="outline">Save</y-button>
                    <y-button data-action="delete" data-id="${u.id}" variant="ghost">Delete</y-button>
                  </span>
                </div>
              </y-card>
            `).join("")}
          </div>
        </y-card>
      </div>
      <y-confirm id="confirm"></y-confirm>
    `;

    this.qsa<HTMLElement>('y-select.role').forEach((sel) => {
      sel.addEventListener('change', () => sel.setAttribute('data-dirty', '1'));
    });

    this.qsa<HTMLElement>('y-button[data-action="save"]').forEach((btn) =>
      btn.addEventListener('click-event' as any, async () => {
        const id = Number(btn.getAttribute('data-id'));
        const sel = this.root.querySelector(`y-select.role[data-id="${id}"]`) as any;
        if (!sel) return;
        const role = sel.value as string;
        const resp = await fetch(import.meta.env.VITE_API + `/admin/users/${id}/role`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role })
        });
        if (resp.ok) sel.removeAttribute('data-dirty');
      })
    );

    this.qsa<HTMLElement>('y-button[data-action="delete"]').forEach((btn) =>
      btn.addEventListener('click-event' as any, async () => {
        const id = Number(btn.getAttribute('data-id'));
        const confirmEl = this.qs('#confirm') as any;
        const ok = await confirmEl.open({
          title: 'Delete user',
          description: `Delete user #${id}? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        });
        if (!ok) return;
        const resp = await fetch(import.meta.env.VITE_API + `/admin/users/${id}`, {
          method: 'DELETE', credentials: 'include'
        });
        if (resp.status === 204) {
          this.users = this.users.filter(u => u.id !== id);
          this.render();
        }
      })
    );
  }

  private fmtDate(s?: string | null): string {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s);
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    } catch {
      return d.toLocaleString();
    }
  }
}
