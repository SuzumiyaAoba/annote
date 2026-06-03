import { useRef } from "react";
import { TabState } from "../../stores/tabsStore";
import { basename } from "../../lib/path";
import { CloseIcon } from "../icons";

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
  return basename(tab.relativePath);
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
      data-testid="tab-item"
      data-tab-path={tab.relativePath ?? ""}
      data-active={isActive ? "true" : "false"}
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
      <span className="tab-label" data-testid="tab-label">
        {fileName(tab)}
        {isDirty && (
          <span className="tab-dirty" data-testid="tab-dirty">
            ●
          </span>
        )}
      </span>
      <button
        className="tab-close"
        data-testid="tab-close-btn"
        title="閉じる"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <CloseIcon size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}
