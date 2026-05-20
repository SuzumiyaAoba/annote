import { useState, useCallback, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import SyntaxViewer from "./components/SyntaxViewer";
import SettingsModal, { AppSettings, DEFAULT_SETTINGS } from "./components/Settings";
import "./App.css";

function isMarkdown(path: string) {
  return /\.(md|markdown)$/i.test(path);
}

type ViewMode = "edit" | "preview" | "split";
type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialSettings(): AppSettings {
  try {
    const stored = localStorage.getItem("settings");
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-editor", settings.fontEditor);
    document.documentElement.style.setProperty("--font-preview", settings.fontPreview);
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const openFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string") {
      const dirPaths = await invoke<string[]>("get_dir_paths", { dirPath: selected });
      // invoke の後にまとめて更新することで React バッチングにより
      // FileTreeView が正しい paths で一度だけ再マウントされる
      setFolderPath(selected);
      setSelectedFile(null);
      setContent("");
      setIsDirty(false);
      setPaths(dirPaths);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (relativePath: string) => {
      if (!folderPath) return;
      if (isDirty && selectedFile) {
        const confirmed = window.confirm("変更を破棄しますか？");
        if (!confirmed) return;
      }
      if (relativePath.endsWith("/")) return;
      const fullPath = `${folderPath}/${relativePath}`;
      try {
        const text = await readTextFile(fullPath);
        setSelectedFile(relativePath);
        setContent(text);
        setIsDirty(false);
      } catch (err) {
        console.error("ファイル読み込みエラー:", fullPath, err);
      }
    },
    [folderPath, isDirty, selectedFile]
  );

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setIsDirty(true);
  }, []);

  const saveFile = useCallback(async () => {
    if (!folderPath || !selectedFile) return;
    setIsSaving(true);
    try {
      const fullPath = `${folderPath}/${selectedFile}`;
      await writeTextFile(fullPath, content);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [folderPath, selectedFile, content]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    },
    [saveFile]
  );

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex={-1}>
      <header className="toolbar">
        <button className="toolbar-btn" onClick={openFolder} title="フォルダを開く">
          <FolderIcon />
          <span>フォルダを開く</span>
        </button>

        <div className="toolbar-center">
          {selectedFile && (
            <span className="file-name">
              {selectedFile}
              {isDirty && <span className="dirty-indicator">●</span>}
            </span>
          )}
        </div>

        <div className="toolbar-right">
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === "edit" ? "active" : ""}`}
              onClick={() => setViewMode("edit")}
              title="編集モード"
            >
              編集
            </button>
            <button
              className={`toggle-btn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
              title="分割表示"
            >
              分割
            </button>
            <button
              className={`toggle-btn ${viewMode === "preview" ? "active" : ""}`}
              onClick={() => setViewMode("preview")}
              title="プレビューモード"
            >
              プレビュー
            </button>
          </div>

          {selectedFile && (
            <button
              className={`toolbar-btn save-btn ${isSaving ? "saving" : ""} ${isDirty ? "dirty" : ""}`}
              onClick={saveFile}
              disabled={isSaving || !isDirty}
              title="保存 (⌘S)"
            >
              {isSaving ? "保存中…" : "保存"}
            </button>
          )}

          <button
            className="toolbar-btn theme-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            className="toolbar-btn theme-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="設定"
          >
            <GearIcon />
          </button>
        </div>
      </header>

      <div className="main-layout">
        <Sidebar
          folderPath={folderPath}
          paths={paths}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onOpenFolder={openFolder}
          theme={theme}
        />

        <div className="content-area">
          {selectedFile ? (
            <>
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={`editor-pane ${viewMode === "split" ? "split" : "full"}`}>
                  <Editor
                    value={content}
                    onChange={handleContentChange}
                    theme={theme}
                    fontFamily={settings.fontEditor}
                  />
                </div>
              )}
              {viewMode === "split" && (
                <div className="preview-pane split">
                  {isMarkdown(selectedFile) ? (
                    <Preview content={content} theme={theme} />
                  ) : (
                    <SyntaxViewer
                      content={content}
                      fileName={selectedFile}
                      theme={theme}
                      fontFamily={settings.fontEditor}
                    />
                  )}
                </div>
              )}
              {viewMode === "preview" && (
                <div className="preview-pane full">
                  {isMarkdown(selectedFile) ? (
                    <Preview content={content} theme={theme} />
                  ) : (
                    <SyntaxViewer
                      content={content}
                      fileName={selectedFile}
                      theme={theme}
                      fontFamily={settings.fontEditor}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <NoteIcon />
              </div>
              <p>
                {folderPath
                  ? "サイドバーからファイルを選択してください"
                  : "「フォルダを開く」からノートフォルダを選択してください"}
              </p>
            </div>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
      />
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default App;
