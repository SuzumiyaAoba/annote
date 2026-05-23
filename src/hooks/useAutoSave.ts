import { useEffect, useRef } from "react";
import { useTabsStore } from "../stores/tabsStore";
import { useSettingsStore } from "../stores/settingsStore";

export function useAutoSave() {
  const activeId = useTabsStore((s) => s.activeId);
  const saveActiveTab = useTabsStore((s) => s.saveActiveTab);
  const getActiveTab = useTabsStore((s) => s.getActiveTab);
  const autosaveMs = useSettingsStore((s) => s.autosaveMs);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autosaveMs === 0 || !activeId) return;
    const tab = getActiveTab();
    if (!tab || !tab.relativePath || tab.content === tab.savedContent) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveActiveTab();
    }, autosaveMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  });
}
