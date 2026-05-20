import { useFileTree, FileTree } from "@pierre/trees/react";
import "./Sidebar.css";

// Catppuccin Mocha カラーパレット
const TREE_THEME: React.CSSProperties = {
  // 背景・テキスト
  "--trees-bg-override": "#181825",           // bg-secondary (サイドバー背景)
  "--trees-fg-override": "#cdd6f4",           // text
  "--trees-fg-muted-override": "#6c7086",     // overlay0
  // ホバー背景
  "--trees-bg-muted-override": "#313244",     // surface0
  // ボーダー
  "--trees-border-color-override": "#45475a", // surface1
  // 選択
  "--trees-selected-bg-override": "#89b4fa",  // blue
  "--trees-selected-fg-override": "#1e1e2e",  // base
  // アクセント
  "--trees-accent-override": "#89b4fa",
  // フォント
  "--trees-font-family-override":
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "--trees-font-size-override": "13px",
  // レイアウト
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
}

export default function Sidebar({
  folderPath,
  paths,
  selectedFile,
  onFileSelect,
  onOpenFolder,
}: SidebarProps) {
  const folderName = folderPath
    ? folderPath.split("/").pop() || folderPath
    : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {folderName ? (
          <button
            className="folder-name-btn"
            onClick={onOpenFolder}
            title={folderPath ?? ""}
          >
            <FolderOpenIcon />
            <span className="folder-name-text">{folderName}</span>
          </button>
        ) : (
          <button className="open-folder-empty-btn" onClick={onOpenFolder}>
            <FolderOpenIcon />
            <span>フォルダを開く</span>
          </button>
        )}
      </div>

      <div className="sidebar-tree">
        {folderPath && paths.length > 0 ? (
          <FileTreeView
            key={folderPath}
            paths={paths}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ) : folderPath ? (
          <div className="empty-folder">フォルダが空です</div>
        ) : null}
      </div>
    </aside>
  );
}

interface FileTreeViewProps {
  paths: string[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

function FileTreeView({ paths, selectedFile, onFileSelect }: FileTreeViewProps) {
  const { model } = useFileTree({
    paths,
    initialExpansion: "open",
    initialSelectedPaths: selectedFile ? [selectedFile] : [],
    onSelectionChange: (selectedPaths) => {
      const path = selectedPaths[0];
      if (path && !path.endsWith("/")) {
        onFileSelect(path);
      }
    },
  });

  return <FileTree model={model} style={TREE_THEME} />;
}

function FolderOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    </svg>
  );
}
