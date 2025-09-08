import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display:block; width:100%; }
        .container { width: min(100%, var(--sm)); margin: 2rem 0; display:flex; flex-direction:column; gap: var(--spacing-md); padding: 0 1rem; box-sizing: border-box; }
        .lede { color: hsl(var(--muted-foreground)); }
        .content { padding-top: .5rem; }
        y-heading { margin-bottom: 0; }
      </style>

      <div class="container">
        <y-heading level="1">Settings</y-heading>
        <y-card>
          <div slot="header">
            <p class="lede">Manage your account, appearance and security preferences.</p>
          </div>
          <div slot="body">
            <y-tabs>
              <y-nav-link href="/settings/account">Account</y-nav-link>
              <y-nav-link href="/settings/appearance">Appearance</y-nav-link>
              <y-nav-link href="/settings/password-and-authentication">Security</y-nav-link>
            </y-tabs>
            <div class="content">
              <y-route-outlet></y-route-outlet>
            </div>
          </div>
        </y-card>
      </div>
    `;
  }
}

customElements.define(`${WC_PREFIX}-settings-page`, SettingsPage);
