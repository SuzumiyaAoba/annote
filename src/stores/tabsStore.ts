import { create } from "zustand";
import { nanoid } from "nanoid";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface TabState {
  id: string;
  relativePath: string | null;
  fullPath: string | null;
  content: string;
  savedContent: string;
  scrollTop?: number;
}

interface TabsStore {
  tabs: TabState[];
  activeId: string | null;
  isSaving: boolean;
  openFile: (folderPath: string, relativePath: string) => Promise<void>;
  closeTab: (id: string) => Promise<void>;
  closeTabByPath: (relativePath: string, folderPath: string) => void;
  renameTabPath: (oldRelativePath: string, newRelativePath: string, folderPath: string) => void;
  setContent: (id: string, value: string) => void;
  saveTab: (id: string) => Promise<void>;
  saveActiveTab: () => Promise<void>;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  setActiveId: (id: string) => void;
  newTab: () => void;
  getActiveTab: () => TabState | null;
  getIsDirty: (id: string) => boolean;
  restoreSession: (folderPath: string) => Promise<void>;
  persistSession: (folderPath: string) => void;
  clearTabs: () => void;
}

function sessionKey(folderPath: string) {
  return `annote-session:${folderPath}`;
}

export const useTabsStore = create<TabsStore>()((set, get) => ({
  tabs: [],
  activeId: null,
  isSaving: false,

  getActiveTab: () => {
    const { tabs, activeId } = get();
    return tabs.find((t) => t.id === activeId) ?? null;
  },

  getIsDirty: (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return false;
    return tab.content !== tab.savedContent;
  },

  openFile: async (folderPath: string, relativePath: string) => {
    if (relativePath.endsWith("/")) return;
    const { tabs, setActiveId } = get();

    const existing = tabs.find((t) => t.relativePath === relativePath);
    if (existing) {
      setActiveId(existing.id);
      return;
    }

    const fullPath = `${folderPath}/${relativePath}`;
    try {
      const content = await readTextFile(fullPath);
      const id = nanoid();
      set((s) => ({
        tabs: [...s.tabs, { id, relativePath, fullPath, content, savedContent: content }],
        activeId: id,
      }));
      get().persistSession(folderPath);
    } catch (err) {
      console.error("ファイル読み込みエラー:", fullPath, err);
    }
  },

  closeTab: async (id: string) => {
    const { tabs, activeId, getIsDirty } = get();
    if (getIsDirty(id)) {
      const confirmed = window.confirm("変更を破棄しますか？");
      if (!confirmed) return;
    }
    const idx = tabs.findIndex((t) => t.id === id);
    const nextTabs = tabs.filter((t) => t.id !== id);
    let nextActiveId: string | null = activeId;
    if (activeId === id) {
      nextActiveId =
        nextTabs[idx]?.id ?? nextTabs[idx - 1]?.id ?? null;
    }
    set({ tabs: nextTabs, activeId: nextActiveId });
  },

  setContent: (id: string, value: string) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, content: value } : t)),
    }));
  },

  saveTab: async (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab?.fullPath) return;
    set({ isSaving: true });
    try {
      await writeTextFile(tab.fullPath, tab.content);
      set((s) => ({
        tabs: s.tabs.map((t) =>
          t.id === id ? { ...t, savedContent: t.content } : t
        ),
      }));
    } finally {
      set({ isSaving: false });
    }
  },

  saveActiveTab: async () => {
    const { activeId, saveTab } = get();
    if (activeId) await saveTab(activeId);
  },

  reorderTabs: (fromIndex: number, toIndex: number) => {
    set((s) => {
      const tabs = [...s.tabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { tabs };
    });
  },

  setActiveId: (id: string) => {
    set({ activeId: id });
  },

  newTab: () => {
    const id = nanoid();
    set((s) => ({
      tabs: [
        ...s.tabs,
        { id, relativePath: null, fullPath: null, content: "", savedContent: "" },
      ],
      activeId: id,
    }));
  },

  clearTabs: () => {
    set({ tabs: [], activeId: null });
  },

  closeTabByPath: (relativePath: string, folderPath: string) => {
    const { tabs, activeId } = get();
    const tab = tabs.find((t) => t.relativePath === relativePath);
    if (!tab) return;
    const idx = tabs.findIndex((t) => t.id === tab.id);
    const nextTabs = tabs.filter((t) => t.id !== tab.id);
    let nextActiveId = activeId;
    if (activeId === tab.id) {
      nextActiveId = nextTabs[idx]?.id ?? nextTabs[idx - 1]?.id ?? null;
    }
    set({ tabs: nextTabs, activeId: nextActiveId });
    if (folderPath) {
      setTimeout(() => get().persistSession(folderPath), 0);
    }
  },

  renameTabPath: (oldRelativePath: string, newRelativePath: string, folderPath: string) => {
    const cleanOld = oldRelativePath.replace(/\/$/, "");
    const cleanNew = newRelativePath.replace(/\/$/, "");
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (!t.relativePath) return t;
        if (t.relativePath === cleanOld) {
          return {
            ...t,
            relativePath: cleanNew,
            fullPath: `${folderPath}/${cleanNew}`,
          };
        }
        return t;
      }),
    }));
    setTimeout(() => get().persistSession(folderPath), 0);
  },

  restoreSession: async (folderPath: string) => {
    try {
      const raw = localStorage.getItem(sessionKey(folderPath));
      if (!raw) return;
      const session: { paths: string[]; activeRelativePath: string | null } =
        JSON.parse(raw);
      if (!Array.isArray(session.paths)) return;

      const loaded: TabState[] = [];
      for (const relativePath of session.paths) {
        const fullPath = `${folderPath}/${relativePath}`;
        try {
          const content = await readTextFile(fullPath);
          loaded.push({
            id: nanoid(),
            relativePath,
            fullPath,
            content,
            savedContent: content,
          });
        } catch {
          // ファイルが消えていたらスキップ
        }
      }

      const activeId =
        loaded.find(
          (t) => t.relativePath === session.activeRelativePath
        )?.id ?? loaded[0]?.id ?? null;

      set({ tabs: loaded, activeId });
    } catch (err) {
      console.error("セッション復元エラー:", err);
    }
  },

  persistSession: (folderPath: string) => {
    const { tabs, activeId } = get();
    const activeTab = tabs.find((t) => t.id === activeId);
    const session = {
      paths: tabs.map((t) => t.relativePath).filter(Boolean) as string[],
      activeRelativePath: activeTab?.relativePath ?? null,
    };
    localStorage.setItem(sessionKey(folderPath), JSON.stringify(session));
  },
}));
