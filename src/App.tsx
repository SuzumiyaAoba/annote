import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import SyntaxViewer from "./components/SyntaxViewer";
import "./App.css";

function isMarkdown(path: string) {
  return /\.(md|markdown)$/i.test(path);
}

type ViewMode = "edit" | "preview" | "split";

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isSaving, setIsSaving] = useState(false);

  const openFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string") {
      setFolderPath(selected);
      setSelectedFile(null);
      setContent("");
      setIsDirty(false);
      const dirPaths = await invoke<string[]>("get_dir_paths", { dirPath: selected });
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
      const fullPath = `${folderPath}/${relativePath}`;
      try {
        const text = await readTextFile(fullPath);
        setSelectedFile(relativePath);
        setContent(text);
        setIsDirty(false);
      } catch {
        // Directory selected, skip
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
              title="プレビューモード（.mdはレンダリング、それ以外はコード表示）"
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
        </div>
      </header>

      <div className="main-layout">
        <Sidebar
          folderPath={folderPath}
          paths={paths}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onOpenFolder={openFolder}
        />

        <div className="content-area">
          {selectedFile ? (
            <>
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={`editor-pane ${viewMode === "split" ? "split" : "full"}`}>
                  <Editor value={content} onChange={handleContentChange} />
                </div>
              )}
              {viewMode === "split" && (
                <div className="preview-pane split">
                  <SyntaxViewer content={content} fileName={selectedFile} />
                </div>
              )}
              {viewMode === "preview" && (
                <div className="preview-pane full">
                  {isMarkdown(selectedFile) ? (
                    <Preview content={content} />
                  ) : (
                    <SyntaxViewer content={content} fileName={selectedFile} />
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

export default App;
