import { useEffect, useRef } from "react";

export function useScrollSync(enabled: boolean) {
  const lockRef = useRef<"editor" | "preview" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const editorEl = document.querySelector(".cm-scroller") as HTMLElement | null;
    const previewEl = document.querySelector(".preview-container") as HTMLElement | null;
    if (!editorEl || !previewEl) return;

    const release = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        lockRef.current = null;
      }, 100);
    };

    const onEditorScroll = () => {
      if (lockRef.current === "preview") return;
      lockRef.current = "editor";
      const scrollable = editorEl.scrollHeight - editorEl.clientHeight;
      if (scrollable <= 0) return;
      const ratio = editorEl.scrollTop / scrollable;
      const previewScrollable = previewEl.scrollHeight - previewEl.clientHeight;
      previewEl.scrollTop = ratio * Math.max(previewScrollable, 0);
      release();
    };

    const onPreviewScroll = () => {
      if (lockRef.current === "editor") return;
      lockRef.current = "preview";
      const scrollable = previewEl.scrollHeight - previewEl.clientHeight;
      if (scrollable <= 0) return;
      const ratio = previewEl.scrollTop / scrollable;
      const editorScrollable = editorEl.scrollHeight - editorEl.clientHeight;
      editorEl.scrollTop = ratio * Math.max(editorScrollable, 0);
      release();
    };

    editorEl.addEventListener("scroll", onEditorScroll, { passive: true });
    previewEl.addEventListener("scroll", onPreviewScroll, { passive: true });

    return () => {
      editorEl.removeEventListener("scroll", onEditorScroll);
      previewEl.removeEventListener("scroll", onPreviewScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled]);
}
