import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "edit" | "split" | "preview";
export type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("annote-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface UiState {
  theme: Theme;
  viewMode: ViewMode;
  isSettingsOpen: boolean;
  toggleTheme: () => void;
  setTheme: (v: Theme) => void;
  setViewMode: (v: ViewMode) => void;
  setIsSettingsOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      viewMode: "split",
      isSettingsOpen: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (v) => set({ theme: v }),
      setViewMode: (v) => set({ viewMode: v }),
      setIsSettingsOpen: (v) => set({ isSettingsOpen: v }),
    }),
    {
      name: "annote-ui",
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);
