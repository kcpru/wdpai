import { WC_PREFIX } from "../../constants/config";
import { ShadowComponent } from "../../utils/shadow-component";
import { toaster } from "../../utils/toaster";

export default class SettingsAppearancePage extends ShadowComponent {
  connectedCallback() {
    this.html`
      <style>
        :host { display: block; }
        form { display: flex; flex-direction: column; gap: .75rem; }
        .field label { font-weight: var(--font-medium); margin-bottom: var(--spacing-xs); display:block; }
  .checkbox { display:flex; align-items:center; gap:.5rem; }
      </style>
      <form id="appearance-settings-form" novalidate>
        <div class="field">
          <label for="theme">Theme</label>
          <y-select id="theme" block>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </y-select>
        </div>

        <div class="field">
          <label for="accent">Accent color</label>
          <y-select id="accent" block>
            <option value="blue">Blue</option>
            <option value="violet">Violet</option>
            <option value="green">Green</option>
          </y-select>
        </div>

        <label class="checkbox">
          <y-checkbox id="compact">Compact density</y-checkbox>
        </label>

        <label class="checkbox">
          <y-checkbox id="reduced">Reduced motion</y-checkbox>
        </label>

        <y-button type="submit">Save changes</y-button>
      </form>
    `;

    // Load existing settings
    const saved = this.loadSettings();
    this.applySettings(saved);
    this.setUI(saved);

    this.on("form#appearance-settings-form", "submit", (e) => {
      e.preventDefault();
      const theme = (this.qs("#theme") as any).value as string;
      const accent = (this.qs("#accent") as any).value as string;
      const compact = (this.qs("#compact") as any).checked === true;
      const reduced = (this.qs("#reduced") as any).checked === true;

      const settings = {
        theme,
        accent,
        compact,
        reduced,
      } as AppearanceSettings;
      this.saveSettings(settings);
      this.applySettings(settings);
      toaster.promise(Promise.resolve(), {
        loading: {
          title: "Saving…",
          description: "Applying appearance preferences",
        },
        success: { title: "Saved", description: "Appearance updated" },
        error: { title: "Error", description: "Could not save preferences" },
      });
    });
  }

  private loadSettings(): AppearanceSettings {
    try {
      const raw = localStorage.getItem("appearance:settings");
      if (!raw)
        return {
          theme: "system",
          accent: "blue",
          compact: false,
          reduced: false,
        };
      const parsed = JSON.parse(raw);
      return {
        theme:
          parsed.theme === "light" || parsed.theme === "dark"
            ? parsed.theme
            : "system",
        accent: ["blue", "violet", "green"].includes(parsed.accent)
          ? parsed.accent
          : "blue",
        compact: !!parsed.compact,
        reduced: !!parsed.reduced,
      };
    } catch {
      return {
        theme: "system",
        accent: "blue",
        compact: false,
        reduced: false,
      };
    }
  }

  private saveSettings(s: AppearanceSettings) {
    localStorage.setItem("appearance:settings", JSON.stringify(s));
  }

  private setUI(s: AppearanceSettings) {
    (this.qs("#theme") as any).value = s.theme;
    (this.qs("#accent") as any).value = s.accent;
    (this.qs("#compact") as any).checked = s.compact;
    (this.qs("#reduced") as any).checked = s.reduced;
  }

  private applySettings(s: AppearanceSettings) {
    const root = document.documentElement;
    root.classList.remove(
      "force-light",
      "force-dark",
      "accent-blue",
      "accent-violet",
      "accent-green",
      "compact",
      "reduced-motion"
    );

    if (s.theme === "light") root.classList.add("force-light");
    else if (s.theme === "dark") root.classList.add("force-dark");

    root.classList.add(`accent-${s.accent}`);
    if (s.compact) root.classList.add("compact");
    if (s.reduced) root.classList.add("reduced-motion");
  }
}

customElements.define(
  `${WC_PREFIX}-settings-appearance-page`,
  SettingsAppearancePage
);

type ThemeMode = "system" | "light" | "dark";
type Accent = "blue" | "violet" | "green";
type AppearanceSettings = {
  theme: ThemeMode;
  accent: Accent;
  compact: boolean;
  reduced: boolean;
};
