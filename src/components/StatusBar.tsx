import { useMemo } from "react";
import { useTabsStore } from "../stores/tabsStore";
import "./StatusBar.css";

function countStats(content: string) {
  const lines = content.split("\n").length;
  const chars = [...content].length;
  const words = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  return { lines, chars, words };
}

export default function StatusBar() {
  const getActiveTab = useTabsStore((s) => s.getActiveTab);
  const isSaving = useTabsStore((s) => s.isSaving);
  const activeTab = getActiveTab();

  const stats = useMemo(
    () => (activeTab ? countStats(activeTab.content) : null),
    [activeTab]
  );

  if (!activeTab) return null;

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {isSaving && <span className="status-saving">保存中…</span>}
      </div>
      <div className="status-bar-right">
        {stats && (
          <>
            <span className="status-item" title="行数">{stats.lines}行</span>
            <span className="status-sep">·</span>
            <span className="status-item" title="単語数">{stats.words}語</span>
            <span className="status-sep">·</span>
            <span className="status-item" title="文字数">{stats.chars}文字</span>
          </>
        )}
      </div>
    </div>
  );
}
