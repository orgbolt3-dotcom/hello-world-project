import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "eco.theme";

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

function apply(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  const effective =
    mode === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  // Dark-first: dark tokens live on :root. Toggle `.light` for light mode,
  // keep `.dark` as a no-op safety class so existing `dark:` variants match.
  document.documentElement.classList.toggle("light", effective === "light");
  document.documentElement.classList.toggle("dark", effective === "dark");
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "dark",
  setMode: (mode) => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, mode);
    apply(mode);
    set({ mode });
  },
}));

export function initTheme() {
  if (typeof window === "undefined") return;
  // Dark-first default; user can opt into light/system explicitly.
  const stored = (window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "dark";
  apply(stored);
  useThemeStore.setState({ mode: stored });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (useThemeStore.getState().mode === "system") apply("system");
  });
}
