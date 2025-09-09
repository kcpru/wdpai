import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";

export default class SettingsAccountPage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; }
        form { display: flex; flex-direction: column; gap: .75rem; }
        .upload-row { display:flex; align-items:center; gap: var(--spacing-sm); }
        .file-name { font-size: var(--text-xs); color: hsl(var(--muted-foreground)); }
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

        <div class="upload-row">
          <input type="file" id="avatar-file" accept="image/*" hidden />
          <y-button id="pick-file" variant="outline" aria-label="Choose avatar">
            Choose avatar
            <y-icon icon="image" slot="icon"></y-icon>
          </y-button>
          <span id="file-name" class="file-name" aria-live="polite"></span>
        </div>

        <y-button type="submit">Save changes</y-button>
      </form>
    `;

    // Wire styled file picker
    const pickBtn = this.qs<HTMLElement>("#pick-file");
    const fileInput = this.qs<HTMLInputElement>("#avatar-file");
    const fileName = this.qs<HTMLSpanElement>("#file-name");
    pickBtn.addEventListener("click-event" as any, () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const f = fileInput.files?.[0];
      fileName.textContent = f ? f.name : "";
    });

    this.on("form#account-settings-form", "submit", async (e) => {
      e.preventDefault();
      const fileEl = this.qs<HTMLInputElement>("#avatar-file");
      try {
        if (fileEl?.files && fileEl.files[0]) {
          const { processAvatarImage } = await import(
            "../../utils/image-process"
          );
          let avatar = "";
          try {
            avatar = await processAvatarImage(fileEl.files[0]);
          } catch {}
          if (avatar) {
            const res = await fetch(
              `${(import.meta as any).env.VITE_API}/settings/avatar`,
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar }),
              }
            );
            if (!res.ok) throw new Error("failed");
          }
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
