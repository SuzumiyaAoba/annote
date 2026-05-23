import { useRef } from "react";
import { TabState } from "../../stores/tabsStore";

interface TabItemProps {
  tab: TabState;
  isActive: boolean;
  isDirty: boolean;
  index: number;
  onActivate: () => void;
  onClose: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
}

function fileName(tab: TabState) {
  if (!tab.relativePath) return "新規ファイル";
  const parts = tab.relativePath.split("/");
  return parts[parts.length - 1];
}

export default function TabItem({
  tab,
  isActive,
  isDirty,
  index,
  onActivate,
  onClose,
  onDragStart,
  onDragOver,
  onDrop,
}: TabItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`tab-item ${isActive ? "active" : ""}`}
      title={tab.relativePath ?? "新規ファイル"}
      draggable
      onClick={onActivate}
      onAuxClick={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          onClose();
        }
      }}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
    >
      <span className="tab-label">
        {fileName(tab)}
        {isDirty && <span className="tab-dirty">●</span>}
      </span>
      <button
        className="tab-close"
        title="閉じる"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
