import { useEffect, useRef } from "react";
import { useTabsStore } from "../stores/tabsStore";
import { useSettingsStore } from "../stores/settingsStore";

export function useAutoSave() {
  const activeId = useTabsStore((s) => s.activeId);
  const saveActiveTab = useTabsStore((s) => s.saveActiveTab);
  const autosaveMs = useSettingsStore((s) => s.autosaveMs);
  const activeContent = useTabsStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeId);
    return tab?.content ?? null;
  });
  const activeSavedContent = useTabsStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeId);
    return tab?.savedContent ?? null;
  });
  const activeRelativePath = useTabsStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeId);
    return tab?.relativePath ?? null;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (
      autosaveMs === 0 ||
      !activeId ||
      !activeRelativePath ||
      activeContent === null ||
      activeContent === activeSavedContent
    )
      return;

    timerRef.current = setTimeout(saveActiveTab, autosaveMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeId, autosaveMs, activeContent, activeSavedContent, activeRelativePath, saveActiveTab]);
}
