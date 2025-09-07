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
        table { border-collapse: separate; border-spacing: 0; width: 100%; background: hsl(var(--card)); color: hsl(var(--card-foreground)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-lg); overflow: hidden; }
        thead th { background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); text-align: left; font-weight: var(--font-medium); }
        th, td { padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid hsl(var(--border)); }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background: hsl(var(--secondary)); }
        .actions { display: flex; gap: var(--spacing-xs); align-items: center; }
        .role-cell { min-width: 9rem; }
        .avatar { display: flex; align-items: center; }
        y-avatar { --avatar-size: 1.75rem; }
  .lede { color: hsl(var(--muted-foreground)); margin: 0; }
  .table-wrap { width: 100%; overflow-x: auto; }
      </style>
      <div class="container">
        <y-card>
          <div slot="header">
            <y-heading level="1">Admin · Users</y-heading>
            <p class="lede">Manage roles and remove accounts.</p>
          </div>

          <div slot="body" class="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Avatar</th><th>Username</th><th class="role-cell">Role</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                ${this.users.map(u => `
                  <tr>
                    <td>${u.id}</td>
                    <td class="avatar">${u.avatar ? `<y-avatar src="${u.avatar}" alt="${u.username}"></y-avatar>` : `<y-avatar></y-avatar>`}</td>
                    <td>${u.username}</td>
                    <td class="role-cell">
                      <y-select variant="outline" data-id="${u.id}" class="role">
                        <option value="user" ${u.role === 'user' ? 'selected' : ''}>user</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                      </y-select>
                    </td>
                    <td>${u.created_at ?? ''}</td>
                    <td class="actions">
                      <y-button data-action="save" data-id="${u.id}" variant="outline">Save</y-button>
                      <y-button data-action="delete" data-id="${u.id}" variant="ghost">Delete</y-button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
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
}
