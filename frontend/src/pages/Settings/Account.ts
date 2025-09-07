import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsAccountPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; }
        form { display: flex; flex-direction: column; gap: .75rem; }
      </style>
      <form id="account-settings-form" novalidate>
        <y-field id="username" type="text" required regex="^[\\w.-]{3,32}$">
          <span slot="label">Username</span>
          <span slot="helper-text">3–32 characters: letters, digits, dot, dash, or underscore.</span>
          <span slot="error-text">Enter a valid username (3–32, letters/digits/._-).</span>
        </y-field>

        <y-field id="email" type="email" required>
          <span slot="label">Email</span>
          <span slot="error-text">Please enter a valid email address.</span>
        </y-field>

        <y-field id="avatar" type="url">
          <span slot="label">Avatar URL</span>
          <span slot="helper-text">Direct image URL (PNG/JPG/WebP).</span>
        </y-field>

        <y-button type="submit">Save changes</y-button>
      </form>
    `;

    this.on("form#account-settings-form", "submit", async (e) => {
      e.preventDefault();
      // Read avatar input
      const avatarHost = this.qs<HTMLElement>("#avatar");
      const input = avatarHost?.shadowRoot?.querySelector("input") as HTMLInputElement | null;
      const avatar = (input?.value || "").trim();
      try {
        if (avatar) {
          const res = await fetch(`${(import.meta as any).env.VITE_API}/settings/avatar`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar }),
          });
          if (!res.ok) throw new Error("failed");
        }
        // Optionally handle username/email later
      } catch {}
    });
  }
}

customElements.define(
  `${WC_PREFIX}-settings-account-page`,
  SettingsAccountPage
);
