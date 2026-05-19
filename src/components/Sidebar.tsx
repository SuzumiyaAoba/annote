import { useFileTree, FileTree } from "@pierre/trees/react";
import "./Sidebar.css";

const TREE_UNSAFE_CSS = `
  button[data-type='item'] {
    border-radius: 4px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #a6adc8;
  }
  button[data-type='item']:hover {
    background: #313244;
    color: #cdd6f4;
  }
  button[data-type='item'][data-item-selected='true'] {
    background: #89b4fa !important;
    color: #1e1e2e !important;
  }
  [data-type='directory-label'] {
    font-size: 13px;
    color: #a6adc8;
  }
`;

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
          // key でフォルダ変更時に useFileTree を強制リマウント
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
    unsafeCSS: TREE_UNSAFE_CSS,
  });

  return (
    <FileTree
      model={model}
      // height はインラインスタイルで指定（Shadow DOM では className が効かない）
      style={{ height: "100%", width: "100%", display: "block" }}
    />
  );
}

function FolderOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    </svg>
  );
}
