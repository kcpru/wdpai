type ThemeMode = "system" | "light" | "dark";
type Accent = "blue" | "violet" | "green";
type AppearanceSettings = {
  theme: ThemeMode;
  accent: Accent;
  compact: boolean;
  reduced: boolean;
};

export function applyAppearanceFromStorage() {
  try {
    const raw = localStorage.getItem("appearance:settings");
    const s: AppearanceSettings = raw
      ? JSON.parse(raw)
      : { theme: "system", accent: "blue", compact: false, reduced: false };

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
  } catch {
    // noop
  }
}
