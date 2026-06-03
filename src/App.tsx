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
import { useScrollSync } from "./hooks/useScrollSync";
import { isMarkdownPath } from "./lib/path";
import { FolderIcon, GearIcon, MoonIcon, NoteIcon, SunIcon } from "./components/icons";
import "./App.css";

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
  const { fontEditor, fontPreview, scrollSync } = useSettingsStore();

  const activeTab = getActiveTab();
  const selectedFile = activeTab?.relativePath ?? null;
  const isDirty = activeTab ? activeTab.content !== activeTab.savedContent : false;

  useAutoSave();
  useScrollSync(viewMode === "split" && scrollSync);

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
    <div className="app" data-testid="app" onKeyDown={handleKeyDown} tabIndex={-1}>
      <header className="toolbar" data-testid="toolbar">
        <button
          className="toolbar-btn"
          data-testid="open-folder-btn"
          onClick={openFolder}
          title="フォルダを開く"
        >
          <FolderIcon />
          <span>フォルダを開く</span>
        </button>

        <div className="toolbar-center">
          {selectedFile && (
            <span className="file-name" data-testid="file-name">
              {selectedFile}
              {isDirty && (
                <span className="dirty-indicator" data-testid="dirty-indicator">
                  ●
                </span>
              )}
            </span>
          )}
        </div>

        <div className="toolbar-right">
          <div className="view-mode-toggle" data-testid="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === "edit" ? "active" : ""}`}
              data-testid="view-mode-edit"
              onClick={() => setViewMode("edit")}
              title="編集モード"
            >
              編集
            </button>
            <button
              className={`toggle-btn ${viewMode === "split" ? "active" : ""}`}
              data-testid="view-mode-split"
              onClick={() => setViewMode("split")}
              title="分割表示"
            >
              分割
            </button>
            <button
              className={`toggle-btn ${viewMode === "preview" ? "active" : ""}`}
              data-testid="view-mode-preview"
              onClick={() => setViewMode("preview")}
              title="プレビューモード"
            >
              プレビュー
            </button>
          </div>

          {selectedFile && (
            <button
              className={`toolbar-btn save-btn ${isSaving ? "saving" : ""} ${isDirty ? "dirty" : ""}`}
              data-testid="save-btn"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              title="保存 (⌘S)"
            >
              {isSaving ? "保存中…" : "保存"}
            </button>
          )}

          <button
            className="toolbar-btn theme-btn"
            data-testid="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {selectedFile && <ExportMenu />}

          <button
            className="toolbar-btn theme-btn"
            data-testid="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="設定"
          >
            <GearIcon />
          </button>
        </div>
      </header>

      <div className="main-layout" data-testid="main-layout">
        <Sidebar
          folderPath={folderPath}
          paths={paths}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onOpenFolder={openFolder}
          theme={theme}
        />

        <div className="editor-area" data-testid="editor-area">
          <TabBar />

          <div className="content-area" data-testid="content-area">
            {tabs.length === 0 ? (
              <div className="empty-state" data-testid="empty-state">
                <div className="empty-state-icon">
                  <NoteIcon />
                </div>
                <p data-testid="empty-state-message">
                  {folderPath
                    ? "サイドバーからファイルを選択してください"
                    : "「フォルダを開く」からノートフォルダを選択してください"}
                </p>
              </div>
            ) : (
              tabs.map((tab) => {
                const isActive = tab.id === activeId;
                const tabIsMarkdown = tab.relativePath ? isMarkdownPath(tab.relativePath) : false;

                return (
                  <div key={tab.id} className={`tab-content${isActive ? "" : " tab-hidden"}`}>
                    {(viewMode === "edit" || viewMode === "split") && (
                      <div
                        className={`editor-pane ${viewMode === "split" ? "split" : "full"}`}
                        data-testid="editor-pane"
                      >
                        <Editor
                          value={tab.content}
                          onChange={isActive ? handleContentChange : () => {}}
                          theme={theme}
                          fontFamily={fontEditor}
                        />
                      </div>
                    )}
                    {viewMode !== "edit" && (
                      <div
                        className={`preview-pane ${viewMode === "split" ? "split" : "full"}`}
                        data-testid="preview-pane"
                      >
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

export default App;
