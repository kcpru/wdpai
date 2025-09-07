import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
        .lede { color: hsl(var(--muted-foreground)); }
        .content { padding-top: .5rem; }
      </style>

      <y-card>
        <div slot="header">
          <y-heading level="1">Settings</y-heading>
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
    `;
  }
}

customElements.define(`${WC_PREFIX}-settings-page`, SettingsPage);
