import React from "react";
import type { FormatAction } from "../../lib/markdown/format";
import {
  BoldIcon,
  CodeBlockIcon,
  CodeIcon,
  HrIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  OlIcon,
  QuoteIcon,
  StrikethroughIcon,
  TableIcon,
  TaskIcon,
  UlIcon,
} from "../icons";
import "./EditorToolbar.css";

interface EditorToolbarProps {
  onFormat: (action: FormatAction) => void;
}

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
