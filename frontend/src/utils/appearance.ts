type ThemeMode = "system" | "light" | "dark";
type Accent = "blue" | "violet" | "green" | "teal" | "orange" | "rose";
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
    // migrate duo accents -> single accents
    const duoMap: Record<string, Accent> = {
      "meadow-duo": "green",
      "earth-duo": "orange",
      "royal-duo": "violet",
    } as const;
    if ((s as any).accent && (s as any).accent in duoMap) {
      (s as any).accent = duoMap[(s as any).accent as keyof typeof duoMap];
      try {
        localStorage.setItem("appearance:settings", JSON.stringify(s));
      } catch {}
    }

    const root = document.documentElement;
    root.classList.remove(
      "force-light",
      "force-dark",
      "compact",
      "reduced-motion"
    );
    // remove any existing accent-* classes
    Array.from(root.classList)
      .filter((c) => c.startsWith("accent-"))
      .forEach((c) => root.classList.remove(c));

    if (s.theme === "light") root.classList.add("force-light");
    else if (s.theme === "dark") root.classList.add("force-dark");

    root.classList.add(`accent-${s.accent}`);
    if (s.compact) root.classList.add("compact");
    if (s.reduced) root.classList.add("reduced-motion");
  } catch {
    // noop
  }
}
