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
          <label for="accent">Accent</label>
          <y-select id="accent" block>
            <option value="blue">Blue</option>
            <option value="violet">Violet</option>
            <option value="green">Green</option>
            <option value="teal">Teal</option>
            <option value="orange">Orange</option>
            <option value="rose">Rose</option>
          </y-select>
        </div>

        <div class="field">
          <label for="text-size">Text size</label>
          <y-select id="text-size" block>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra large</option>
          </y-select>
        </div>

        <div class="field">
          <label for="radius">Corner radius</label>
          <y-select id="radius" block>
            <option value="default">Default</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
          </y-select>
        </div>

        <label class="checkbox">
          <y-checkbox id="compact">Compact density</y-checkbox>
        </label>

        <label class="checkbox">
          <y-checkbox id="reduced">Reduced motion</y-checkbox>
        </label>

        <label class="checkbox">
          <y-checkbox id="high-contrast">High contrast</y-checkbox>
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
      const textSize = (this.qs("#text-size") as any).value as string;
      const radius = (this.qs("#radius") as any).value as string;
      const compact = (this.qs("#compact") as any).checked === true;
      const reduced = (this.qs("#reduced") as any).checked === true;
      const highContrast = (this.qs("#high-contrast") as any).checked === true;

      const settings = {
        theme,
        accent,
        textSize: textSize as TextSize,
        radius: radius as Radius,
        compact,
        reduced,
        highContrast,
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
          textSize: "md",
          radius: "default",
          compact: false,
          reduced: false,
          highContrast: false,
        };
      const parsed = JSON.parse(raw);
      const allowedAccents = [
        "blue",
        "violet",
        "green",
        "teal",
        "orange",
        "rose",
      ];
      // migrate duo to nearest single
      const duoMap: Record<string, (typeof allowedAccents)[number]> = {
        "meadow-duo": "green",
        "earth-duo": "orange",
        "royal-duo": "violet",
      };
      if (parsed?.accent && duoMap[parsed.accent]) {
        parsed.accent = duoMap[parsed.accent];
        try {
          localStorage.setItem("appearance:settings", JSON.stringify(parsed));
        } catch {}
      }
      return {
        theme:
          parsed.theme === "light" || parsed.theme === "dark"
            ? parsed.theme
            : "system",
        accent: allowedAccents.includes(parsed.accent) ? parsed.accent : "blue",
        textSize: ["sm", "md", "lg", "xl"].includes(parsed.textSize)
          ? parsed.textSize
          : "md",
        radius: ["default", "square", "rounded"].includes(parsed.radius)
          ? parsed.radius
          : "default",
        compact: !!parsed.compact,
        reduced: !!parsed.reduced,
        highContrast: !!parsed.highContrast,
      };
    } catch {
      return {
        theme: "system",
        accent: "blue",
        textSize: "md",
        radius: "default",
        compact: false,
        reduced: false,
        highContrast: false,
      };
    }
  }

  private saveSettings(s: AppearanceSettings) {
    localStorage.setItem("appearance:settings", JSON.stringify(s));
  }

  private setUI(s: AppearanceSettings) {
    (this.qs("#theme") as any).value = s.theme;
    (this.qs("#accent") as any).value = s.accent;
    (this.qs("#text-size") as any).value = s.textSize;
    (this.qs("#radius") as any).value = s.radius;
    (this.qs("#compact") as any).checked = s.compact;
    (this.qs("#reduced") as any).checked = s.reduced;
    (this.qs("#high-contrast") as any).checked = s.highContrast;
  }

  private applySettings(s: AppearanceSettings) {
    const root = document.documentElement;
    root.classList.remove(
      "force-light",
      "force-dark",
      "compact",
      "reduced-motion",
      "text-scale-sm",
      "text-scale-md",
      "text-scale-lg",
      "text-scale-xl",
      "radius-square",
      "radius-rounded",
      "high-contrast"
    );
    // remove any previous accent-* class
    Array.from(root.classList)
      .filter((c) => c.startsWith("accent-"))
      .forEach((c) => root.classList.remove(c));

    if (s.theme === "light") root.classList.add("force-light");
    else if (s.theme === "dark") root.classList.add("force-dark");

    root.classList.add(`accent-${s.accent}`);
    if (s.compact) root.classList.add("compact");
    if (s.reduced) root.classList.add("reduced-motion");

    // text size
    root.classList.add(`text-scale-${s.textSize}`);
    // corner radius
    if (s.radius === "square") root.classList.add("radius-square");
    if (s.radius === "rounded") root.classList.add("radius-rounded");
    // high contrast
    if (s.highContrast) root.classList.add("high-contrast");
  }
}

customElements.define(
  `${WC_PREFIX}-settings-appearance-page`,
  SettingsAppearancePage
);

type ThemeMode = "system" | "light" | "dark";
type Accent = "blue" | "violet" | "green" | "teal" | "orange" | "rose";
type TextSize = "sm" | "md" | "lg" | "xl";
type Radius = "default" | "square" | "rounded";
type AppearanceSettings = {
  theme: ThemeMode;
  accent: Accent;
  textSize: TextSize;
  radius: Radius;
  compact: boolean;
  reduced: boolean;
  highContrast: boolean;
};
