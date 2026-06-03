import { create } from "zustand";
import { open } from "@tauri-apps/plugin-dialog";
import { mkdir, writeTextFile, rename, remove } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { useTabsStore } from "./tabsStore";
import { joinPath, replaceBasename, stripTrailingSlash } from "../lib/path";

export interface WorkspaceState {
  folderPath: string | null;
  paths: string[];
  openFolder: () => Promise<void>;
  refreshPaths: () => Promise<void>;
  createFile: (dirRelativePath: string, name: string) => Promise<void>;
  createDir: (dirRelativePath: string, name: string) => Promise<void>;
  renameEntry: (oldRelativePath: string, newName: string) => Promise<void>;
  deleteEntry: (relativePath: string, isDir: boolean) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  folderPath: null,
  paths: [],

  openFolder: async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected !== "string") return;
    const dirPaths = await invoke<string[]>("get_dir_paths", {
      dirPath: selected,
    });
    set({ folderPath: selected, paths: dirPaths });
    useTabsStore.getState().clearTabs();
    await useTabsStore.getState().restoreSession(selected);
  },

  refreshPaths: async () => {
    const { folderPath } = get();
    if (!folderPath) return;
    const dirPaths = await invoke<string[]>("get_dir_paths", {
      dirPath: folderPath,
    });
    set({ paths: dirPaths });
  },

  createFile: async (dirRelativePath: string, name: string) => {
    const { folderPath, refreshPaths } = get();
    if (!folderPath) return;
    await writeTextFile(joinPath(folderPath, dirRelativePath, name), "");
    await refreshPaths();
  },

  createDir: async (dirRelativePath: string, name: string) => {
    const { folderPath, refreshPaths } = get();
    if (!folderPath) return;
    await mkdir(joinPath(folderPath, dirRelativePath, name), { recursive: true });
    await refreshPaths();
  },

  renameEntry: async (oldRelativePath: string, newName: string) => {
    const { folderPath, refreshPaths } = get();
    if (!folderPath) return;
    const newRelativePath = replaceBasename(oldRelativePath, newName);
    const oldFull = joinPath(folderPath, oldRelativePath);
    const newFull = joinPath(folderPath, newRelativePath);
    await rename(oldFull, newFull);
    // タブのパスを更新
    useTabsStore.getState().renameTabPath(oldRelativePath, newRelativePath, folderPath);
    await refreshPaths();
  },

  deleteEntry: async (relativePath: string, isDir: boolean) => {
    const { folderPath, refreshPaths } = get();
    if (!folderPath) return;
    const cleanPath = stripTrailingSlash(relativePath);
    const { tabs } = useTabsStore.getState();
    const affectedTabs = isDir
      ? tabs.filter((t) => t.relativePath?.startsWith(`${cleanPath}/`))
      : tabs.filter((t) => t.relativePath === relativePath);
    const dirtyCount = affectedTabs.filter((t) => t.content !== t.savedContent).length;
    const message =
      dirtyCount > 0
        ? `「${cleanPath}」を削除しますか？\n未保存の変更が ${dirtyCount} 件あります。削除すると失われます。`
        : `「${cleanPath}」を削除しますか？`;
    if (!window.confirm(message)) return;
    const fullPath = joinPath(folderPath, cleanPath);
    await remove(fullPath, { recursive: isDir });
    for (const tab of affectedTabs) {
      if (tab.relativePath) {
        useTabsStore.getState().closeTabByPath(tab.relativePath, folderPath);
      }
    }
    await refreshPaths();
  },
}));
