import { useCallback, useRef, useState } from "react";
import { useFileTree, FileTree } from "@pierre/trees/react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useTabsStore } from "../stores/tabsStore";
import { basename, isDirPath, parentDir, stripTrailingSlash } from "../lib/path";
import { DeleteIcon, FolderOpenIcon, NewFileIcon, NewFolderIcon, RenameIcon } from "./icons";
import "./Sidebar.css";

const TREE_THEME_DARK: React.CSSProperties = {
  "--trees-bg-override": "#161b22",
  "--trees-fg-override": "#e6edf3",
  "--trees-fg-muted-override": "#8b949e",
  "--trees-bg-muted-override": "#21262d",
  "--trees-border-color-override": "#30363d",
  "--trees-selected-bg-override": "#388bfd26",
  "--trees-selected-fg-override": "#58a6ff",
  "--trees-accent-override": "#58a6ff",
  "--trees-font-family-override":
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "--trees-font-size-override": "13px",
  height: "100%",
  width: "100%",
  display: "block",
} as React.CSSProperties;

const TREE_THEME_LIGHT: React.CSSProperties = {
  "--trees-bg-override": "#f6f8fa",
  "--trees-fg-override": "#1f2328",
  "--trees-fg-muted-override": "#656d76",
  "--trees-bg-muted-override": "#eaeef2",
  "--trees-border-color-override": "#d0d7de",
  "--trees-selected-bg-override": "#0969da1a",
  "--trees-selected-fg-override": "#0969da",
  "--trees-accent-override": "#0969da",
  "--trees-font-family-override":
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "--trees-font-size-override": "13px",
  height: "100%",
  width: "100%",
  display: "block",
} as React.CSSProperties;

interface SidebarProps {
  folderPath: string | null;
  paths: string[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onOpenFolder: () => void;
  theme: "dark" | "light";
}

interface PromptState {
  message: string;
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function Sidebar({
  folderPath,
  paths,
  selectedFile,
  onFileSelect,
  onOpenFolder,
  theme,
}: SidebarProps) {
  const { createFile, createDir, renameEntry, deleteEntry } = useWorkspaceStore();
  const { persistSession } = useTabsStore();
  const [promptState, setPromptState] = useState<PromptState | null>(null);

  const showPrompt = useCallback((message: string, defaultValue = "") => {
    return new Promise<string | null>((resolve) => {
      setPromptState({
        message,
        defaultValue,
        onConfirm: (value) => {
          setPromptState(null);
          resolve(value);
        },
        onCancel: () => {
          setPromptState(null);
          resolve(null);
        },
      });
    });
  }, []);

  const folderName = folderPath ? basename(folderPath) || folderPath : null;

  const getSelectedDir = useCallback(() => {
    if (!selectedFile) return "";
    return isDirPath(selectedFile) ? stripTrailingSlash(selectedFile) : parentDir(selectedFile);
  }, [selectedFile]);

  const handleNewFile = useCallback(async () => {
    if (!folderPath) return;
    const name = await showPrompt("新規ファイル名:");
    if (!name?.trim()) return;
    const fileName = name.trim().includes(".") ? name.trim() : `${name.trim()}.md`;
    await createFile(getSelectedDir(), fileName);
  }, [folderPath, getSelectedDir, createFile, showPrompt]);

  const handleNewFolder = useCallback(async () => {
    if (!folderPath) return;
    const name = await showPrompt("新規フォルダ名:");
    if (!name?.trim()) return;
    await createDir(getSelectedDir(), name.trim());
  }, [folderPath, getSelectedDir, createDir, showPrompt]);

  const handleRename = useCallback(async () => {
    if (!selectedFile) return;
    const baseName = basename(selectedFile);
    const newName = await showPrompt("新しい名前:", baseName);
    if (!newName?.trim() || newName.trim() === baseName) return;
    await renameEntry(selectedFile, newName.trim());
    if (folderPath) persistSession(folderPath);
  }, [selectedFile, renameEntry, folderPath, persistSession, showPrompt]);

  const handleDelete = useCallback(async () => {
    if (!selectedFile) return;
    const isDir = isDirPath(selectedFile);
    await deleteEntry(selectedFile, isDir);
    if (folderPath) persistSession(folderPath);
  }, [selectedFile, deleteEntry, folderPath, persistSession]);

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-header" data-testid="sidebar-header">
        {folderName ? (
          <button
            className="folder-name-btn"
            data-testid="folder-name-btn"
            onClick={onOpenFolder}
            title={folderPath ?? ""}
          >
            <FolderOpenIcon />
            <span className="folder-name-text" data-testid="folder-name-text">
              {folderName}
            </span>
          </button>
        ) : (
          <button
            className="open-folder-empty-btn"
            data-testid="sidebar-open-folder-btn"
            onClick={onOpenFolder}
          >
            <FolderOpenIcon />
            <span>フォルダを開く</span>
          </button>
        )}
        {folderPath && (
          <div className="sidebar-actions" data-testid="sidebar-actions">
            <button
              className="sidebar-action-btn"
              data-testid="new-file-btn"
              title="新規ファイル"
              onClick={handleNewFile}
            >
              <NewFileIcon />
            </button>
            <button
              className="sidebar-action-btn"
              data-testid="new-folder-btn"
              title="新規フォルダ"
              onClick={handleNewFolder}
            >
              <NewFolderIcon />
            </button>
            {selectedFile && (
              <>
                <button
                  className="sidebar-action-btn"
                  data-testid="rename-btn"
                  title="リネーム"
                  onClick={handleRename}
                >
                  <RenameIcon />
                </button>
                <button
                  className="sidebar-action-btn sidebar-action-danger"
                  data-testid="delete-btn"
                  title="削除"
                  onClick={handleDelete}
                >
                  <DeleteIcon />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-tree" data-testid="sidebar-tree">
        {folderPath && paths.length > 0 ? (
          <FileTreeView
            key={folderPath}
            paths={paths}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            theme={theme}
          />
        ) : folderPath ? (
          <div className="empty-folder" data-testid="empty-folder">
            フォルダが空です
          </div>
        ) : null}
      </div>
      {promptState && (
        <InputPromptModal
          message={promptState.message}
          defaultValue={promptState.defaultValue}
          onConfirm={promptState.onConfirm}
          onCancel={promptState.onCancel}
        />
      )}
    </aside>
  );
}

interface FileTreeViewProps {
  paths: string[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  theme: "dark" | "light";
}

function FileTreeView({ paths, selectedFile, onFileSelect, theme }: FileTreeViewProps) {
  const { model } = useFileTree({
    paths,
    initialExpansion: "closed",
    initialSelectedPaths: selectedFile ? [selectedFile] : [],
    onSelectionChange: (selectedPaths) => {
      const path = selectedPaths[0];
      if (path && !isDirPath(path)) {
        onFileSelect(path);
      }
    },
  });

  const treeTheme = theme === "dark" ? TREE_THEME_DARK : TREE_THEME_LIGHT;
  return <FileTree model={model} style={treeTheme} />;
}

interface InputPromptModalProps {
  message: string;
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

function InputPromptModal({ message, defaultValue, onConfirm, onCancel }: InputPromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select all on mount
  const handleMount = useCallback((el: HTMLInputElement | null) => {
    if (!el) return;
    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    el.focus();
    el.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="prompt-backdrop" data-testid="prompt-backdrop" onClick={onCancel}>
      <div className="prompt-modal" data-testid="prompt-modal" onClick={(e) => e.stopPropagation()}>
        <p className="prompt-message" data-testid="prompt-message">
          {message}
        </p>
        <input
          ref={handleMount}
          className="prompt-input"
          data-testid="prompt-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="prompt-actions">
          <button
            className="prompt-btn prompt-btn-cancel"
            data-testid="prompt-cancel-btn"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            className="prompt-btn prompt-btn-confirm"
            data-testid="prompt-confirm-btn"
            onClick={() => onConfirm(value)}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
