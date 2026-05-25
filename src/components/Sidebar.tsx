import { useCallback, useRef, useState } from "react";
import { useFileTree, FileTree } from "@pierre/trees/react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useTabsStore } from "../stores/tabsStore";
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
  const newFileInputRef = useRef<HTMLInputElement | null>(null);
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

  const folderName = folderPath ? folderPath.split("/").pop() || folderPath : null;

  const getSelectedDir = useCallback(() => {
    if (!selectedFile) return "";
    if (selectedFile.endsWith("/")) {
      return selectedFile.replace(/\/$/, "");
    }
    const parts = selectedFile.split("/");
    parts.pop();
    return parts.join("/");
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
    const baseName = selectedFile.replace(/\/$/, "").split("/").pop() ?? "";
    const newName = await showPrompt("新しい名前:", baseName);
    if (!newName?.trim() || newName.trim() === baseName) return;
    await renameEntry(selectedFile, newName.trim());
    if (folderPath) persistSession(folderPath);
  }, [selectedFile, renameEntry, folderPath, persistSession, showPrompt]);

  const handleDelete = useCallback(async () => {
    if (!selectedFile) return;
    const isDir = selectedFile.endsWith("/");
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
      <input ref={newFileInputRef} style={{ display: "none" }} />
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
      if (path && !path.endsWith("/")) {
        onFileSelect(path);
      }
    },
  });

  const treeTheme = theme === "dark" ? TREE_THEME_DARK : TREE_THEME_LIGHT;
  return <FileTree model={model} style={treeTheme} />;
}

function FolderOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    </svg>
  );
}

function NewFileIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function NewFolderIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function RenameIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
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
      <div
        className="prompt-modal"
        data-testid="prompt-modal"
        onClick={(e) => e.stopPropagation()}
      >
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
