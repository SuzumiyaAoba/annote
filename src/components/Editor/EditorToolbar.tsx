import React from "react";
import "./EditorToolbar.css";

interface EditorToolbarProps {
  onFormat: (action: FormatAction) => void;
}

export type FormatAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "task"
  | "quote"
  | "code"
  | "codeblock"
  | "link"
  | "image"
  | "hr"
  | "table";

interface ToolbarButton {
  action: FormatAction;
  label: string;
  title: string;
  icon: () => React.ReactElement;
}

const TOOLBAR_BUTTONS: (ToolbarButton | "sep")[] = [
  { action: "h1", label: "H1", title: "見出し 1", icon: () => <span>H1</span> },
  { action: "h2", label: "H2", title: "見出し 2", icon: () => <span>H2</span> },
  { action: "h3", label: "H3", title: "見出し 3", icon: () => <span>H3</span> },
  "sep",
  { action: "bold", label: "B", title: "太字 (⌘B)", icon: BoldIcon },
  { action: "italic", label: "I", title: "斜体 (⌘I)", icon: ItalicIcon },
  { action: "strikethrough", label: "S", title: "取り消し線", icon: StrikethroughIcon },
  "sep",
  { action: "ul", label: "UL", title: "箇条書きリスト", icon: UlIcon },
  { action: "ol", label: "OL", title: "番号付きリスト", icon: OlIcon },
  { action: "task", label: "☑", title: "タスクリスト", icon: TaskIcon },
  { action: "quote", label: "❝", title: "引用", icon: QuoteIcon },
  "sep",
  { action: "code", label: "`", title: "インラインコード", icon: CodeIcon },
  { action: "codeblock", label: "```", title: "コードブロック", icon: CodeBlockIcon },
  "sep",
  { action: "link", label: "🔗", title: "リンク", icon: LinkIcon },
  { action: "image", label: "🖼", title: "画像", icon: ImageIcon },
  { action: "table", label: "⊞", title: "テーブル", icon: TableIcon },
  { action: "hr", label: "—", title: "水平線", icon: HrIcon },
];

export default function EditorToolbar({ onFormat }: EditorToolbarProps) {
  return (
    <div className="editor-toolbar">
      {TOOLBAR_BUTTONS.map((item, i) => {
        if (item === "sep") {
          return <div key={`sep-${i}`} className="toolbar-sep" />;
        }
        return (
          <button
            key={item.action}
            className="toolbar-format-btn"
            title={item.title}
            onMouseDown={(e) => {
              e.preventDefault();
              onFormat(item.action);
            }}
          >
            <item.icon />
          </button>
        );
      })}
    </div>
  );
}

function BoldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
}
function ItalicIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
}
function StrikethroughIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 6.8 3.3h.4M8.6 19c2.3.6 4.4 1 6.2.9 2.7 0 5.3-.7 5.3-3.6 0-1.5-1.8-3.3-6.8-3.3H13"/><line x1="4" y1="12" x2="20" y2="12"/></svg>;
}
function UlIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function OlIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
}
function TaskIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function QuoteIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;
}
function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}
function CodeBlockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function ImageIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
function TableIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/></svg>;
}
function HrIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>;
}
