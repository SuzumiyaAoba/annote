import { create } from "zustand";
import { persist } from "zustand/middleware";

export type KeymapMode = "default" | "vim" | "emacs";

export interface SettingsState {
  fontEditor: string;
  fontPreview: string;
  keymap: KeymapMode;
  autosaveMs: number;
  scrollSync: boolean;
  tocOpen: boolean;
  setFontEditor: (v: string) => void;
  setFontPreview: (v: string) => void;
  setKeymap: (v: KeymapMode) => void;
  setAutosaveMs: (v: number) => void;
  setScrollSync: (v: boolean) => void;
  setTocOpen: (v: boolean) => void;
}

const DEFAULT_FONT_EDITOR = '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
const DEFAULT_FONT_PREVIEW =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontEditor: DEFAULT_FONT_EDITOR,
      fontPreview: DEFAULT_FONT_PREVIEW,
      keymap: "default",
      autosaveMs: 800,
      scrollSync: true,
      tocOpen: true,
      setFontEditor: (v) => set({ fontEditor: v }),
      setFontPreview: (v) => set({ fontPreview: v }),
      setKeymap: (v) => set({ keymap: v }),
      setAutosaveMs: (v) => set({ autosaveMs: v }),
      setScrollSync: (v) => set({ scrollSync: v }),
      setTocOpen: (v) => set({ tocOpen: v }),
    }),
    {
      name: "annote-settings",
    },
  ),
);
