import { useRef, useState } from "react";
import { useTabsStore } from "../../stores/tabsStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import TabItem from "./TabItem";
import "./TabBar.css";

export default function TabBar() {
  const { tabs, activeId, closeTab, setActiveId, reorderTabs, persistSession } = useTabsStore();
  const folderPath = useWorkspaceStore((s) => s.folderPath);
  const dragFromRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (tabs.length === 0) return null;

  const handleDrop = (toIndex: number) => {
    const from = dragFromRef.current;
    if (from !== null && from !== toIndex) {
      reorderTabs(from, toIndex);
      if (folderPath) persistSession(folderPath);
    }
    dragFromRef.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab, index) => (
        <div key={tab.id} className={`tab-wrapper ${dragOverIndex === index ? "drag-over" : ""}`}>
          <TabItem
            tab={tab}
            isActive={tab.id === activeId}
            isDirty={tab.content !== tab.savedContent}
            index={index}
            onActivate={() => setActiveId(tab.id)}
            onClose={() => {
              closeTab(tab.id).then(() => {
                if (folderPath) persistSession(folderPath);
              });
            }}
            onDragStart={(i) => {
              dragFromRef.current = i;
            }}
            onDragOver={(i) => setDragOverIndex(i)}
            onDrop={handleDrop}
          />
        </div>
      ))}
    </div>
  );
}
