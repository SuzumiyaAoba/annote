import { useCallback, useRef, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useTabsStore } from "../stores/tabsStore";
import "./ExportMenu.css";

export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const getActiveTab = useTabsStore((s) => s.getActiveTab);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExportHtml = useCallback(async () => {
    const tab = getActiveTab();
    if (!tab) return;
    setOpen(false);

    const previewEl = document.querySelector(".preview-container .markdown-body") as HTMLElement;
    if (!previewEl) {
      alert("プレビューが表示されていません。分割または プレビューモードに切り替えてください。");
      return;
    }

    const fileName = tab.relativePath?.replace(/\.(md|markdown)$/i, "") ?? "export";
    const safeTitle = fileName
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const targetPath = await save({
      defaultPath: `${fileName}.html`,
      filters: [{ name: "HTML", extensions: ["html"] }],
    });
    if (!targetPath) return;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n")
      .replace(/<\/style/gi, "<\\/style");

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<style>${styles}</style>
</head>
<body class="markdown-body" data-theme="light" style="max-width:900px;margin:0 auto;padding:40px 24px;">
${previewEl.innerHTML}
</body>
</html>`;

    await writeTextFile(targetPath, html);
  }, [getActiveTab]);

  const handlePrint = useCallback(() => {
    setOpen(false);
    window.print();
  }, []);

  return (
    <div className="export-menu-wrapper" ref={menuRef}>
      <button className="toolbar-btn" title="エクスポート" onClick={() => setOpen((v) => !v)}>
        <ExportIcon />
      </button>
      {open && (
        <>
          <div className="export-backdrop" onClick={() => setOpen(false)} />
          <div className="export-dropdown">
            <button className="export-item" onClick={handleExportHtml}>
              <HtmlIcon />
              <span>HTML として書き出し</span>
            </button>
            <button className="export-item" onClick={handlePrint}>
              <PrintIcon />
              <span>印刷 / PDF に保存</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ExportIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function HtmlIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
