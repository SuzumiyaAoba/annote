import { useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import SyntaxViewer from "./components/SyntaxViewer";
import SettingsModal from "./components/Settings";
import TabBar from "./components/Tabs/TabBar";
import StatusBar from "./components/StatusBar";
import ExportMenu from "./components/ExportMenu";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useTabsStore } from "./stores/tabsStore";
import { useUiStore } from "./stores/uiStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useAutoSave } from "./hooks/useAutoSave";
import "./App.css";

function isMarkdown(path: string) {
  return /\.(md|markdown)$/i.test(path);
}

function App() {
  const { folderPath, paths, openFolder } = useWorkspaceStore();
  const {
    tabs,
    activeId,
    isSaving,
    openFile,
    setContent,
    saveActiveTab,
    getActiveTab,
    persistSession,
  } = useTabsStore();
  const { theme, viewMode, isSettingsOpen, toggleTheme, setViewMode, setIsSettingsOpen } =
    useUiStore();
  const { fontEditor, fontPreview } = useSettingsStore();

  const activeTab = getActiveTab();
  const selectedFile = activeTab?.relativePath ?? null;
  const isDirty = activeTab ? activeTab.content !== activeTab.savedContent : false;

  useAutoSave();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-editor", fontEditor);
  }, [fontEditor]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-preview", fontPreview);
  }, [fontPreview]);

  const handleContentChange = useCallback(
    (value: string) => {
      if (!activeId) return;
      setContent(activeId, value);
    },
    [activeId, setContent],
  );

  const handleFileSelect = useCallback(
    async (relativePath: string) => {
      if (!folderPath) return;
      await openFile(folderPath, relativePath);
      persistSession(folderPath);
    },
    [folderPath, openFile, persistSession],
  );

  const handleSave = useCallback(() => {
    saveActiveTab();
  }, [saveActiveTab]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave],
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
              onClick={handleSave}
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

          {selectedFile && <ExportMenu />}

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

        <div className="editor-area">
          <TabBar />

          <div className="content-area">
            {tabs.length === 0 ? (
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
            ) : (
              tabs.map((tab) => {
                const isActive = tab.id === activeId;
                const tabIsMarkdown = tab.relativePath ? isMarkdown(tab.relativePath) : false;

                return (
                  <div key={tab.id} className={`tab-content${isActive ? "" : " tab-hidden"}`}>
                    {(viewMode === "edit" || viewMode === "split") && (
                      <div className={`editor-pane ${viewMode === "split" ? "split" : "full"}`}>
                        <Editor
                          value={tab.content}
                          onChange={isActive ? handleContentChange : () => {}}
                          theme={theme}
                          fontFamily={fontEditor}
                        />
                      </div>
                    )}
                    {viewMode !== "edit" && (
                      <div className={`preview-pane ${viewMode === "split" ? "split" : "full"}`}>
                        {tabIsMarkdown ? (
                          <Preview content={tab.content} theme={theme} />
                        ) : (
                          <SyntaxViewer
                            content={tab.content}
                            fileName={tab.relativePath ?? ""}
                            theme={theme}
                            fontFamily={fontEditor}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <StatusBar />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
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
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default App;
