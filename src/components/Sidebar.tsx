import { useFileTree, FileTree } from "@pierre/trees/react";
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

export default function Sidebar({
  folderPath,
  paths,
  selectedFile,
  onFileSelect,
  onOpenFolder,
  theme,
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
            theme={theme}
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
  theme: "dark" | "light";
}

function FileTreeView({ paths, selectedFile, onFileSelect, theme }: FileTreeViewProps) {
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
