import { useCallback, useRef, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useTabsStore } from "../stores/tabsStore";
import { stripMarkdownExt } from "../lib/path";
import { ExportIcon, HtmlIcon, PrintIcon } from "./icons";
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

    const fileName = tab.relativePath ? stripMarkdownExt(tab.relativePath) : "export";
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
    <div className="export-menu-wrapper" data-testid="export-menu" ref={menuRef}>
      <button
        className="toolbar-btn"
        data-testid="export-menu-btn"
        title="エクスポート"
        onClick={() => setOpen((v) => !v)}
      >
        <ExportIcon />
      </button>
      {open && (
        <>
          <div
            className="export-backdrop"
            data-testid="export-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="export-dropdown" data-testid="export-dropdown">
            <button
              className="export-item"
              data-testid="export-html-btn"
              onClick={handleExportHtml}
            >
              <HtmlIcon />
              <span>HTML として書き出し</span>
            </button>
            <button className="export-item" data-testid="export-print-btn" onClick={handlePrint}>
              <PrintIcon />
              <span>印刷 / PDF に保存</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
