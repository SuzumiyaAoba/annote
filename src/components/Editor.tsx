import { useCallback, useMemo, useRef } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { foldGutter, codeFolding } from "@codemirror/language";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { autocompletion } from "@codemirror/autocomplete";
import { vim } from "./Editor/extensions/vim";
import { emacs } from "./Editor/extensions/emacs";
import EditorToolbar, { FormatAction } from "./Editor/EditorToolbar";
import { useSettingsStore } from "../stores/settingsStore";
import "./Editor.css";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: "dark" | "light";
  fontFamily: string;
}

const BASE_EXTENSIONS = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
  foldGutter(),
  codeFolding(),
  autocompletion(),
];

export default function Editor({ value, onChange, theme, fontFamily }: EditorProps) {
  const keymap = useSettingsStore((s) => s.keymap);
  const editorViewRef = useRef<EditorView | null>(null);

  const fontTheme = useMemo(
    () =>
      EditorView.theme({
        ".cm-scroller": { fontFamily },
        ".cm-content": { fontFamily },
      }),
    [fontFamily],
  );

  const keymapExtension = useMemo(() => {
    if (keymap === "vim") return [vim()];
    if (keymap === "emacs") return [emacs()];
    return [];
  }, [keymap]);

  const extensions = useMemo(
    () => [...BASE_EXTENSIONS, fontTheme, ...keymapExtension],
    [fontTheme, keymapExtension],
  );

  const handleCreateEditor = useCallback((view: EditorView) => {
    editorViewRef.current = view;
  }, []);

  const handleFormat = useCallback((action: FormatAction) => {
    const view = editorViewRef.current;
    if (!view) return;

    const { state } = view;
    const { from, to } = state.selection.main;
    const selectedText = state.doc.sliceString(from, to);

    let insert = "";
    let newFrom = from;
    let newTo = to;

    switch (action) {
      case "bold":
        insert = `**${selectedText || "太字テキスト"}**`;
        newFrom = from + 2;
        newTo = from + 2 + (selectedText || "太字テキスト").length;
        break;
      case "italic":
        insert = `*${selectedText || "斜体テキスト"}*`;
        newFrom = from + 1;
        newTo = from + 1 + (selectedText || "斜体テキスト").length;
        break;
      case "strikethrough":
        insert = `~~${selectedText || "テキスト"}~~`;
        newFrom = from + 2;
        newTo = from + 2 + (selectedText || "テキスト").length;
        break;
      case "h1":
        insert = `# ${selectedText || "見出し 1"}`;
        newFrom = from + 2;
        newTo = from + 2 + (selectedText || "見出し 1").length;
        break;
      case "h2":
        insert = `## ${selectedText || "見出し 2"}`;
        newFrom = from + 3;
        newTo = from + 3 + (selectedText || "見出し 2").length;
        break;
      case "h3":
        insert = `### ${selectedText || "見出し 3"}`;
        newFrom = from + 4;
        newTo = from + 4 + (selectedText || "見出し 3").length;
        break;
      case "ul":
        insert = `- ${selectedText || "リスト項目"}`;
        newFrom = from + 2;
        newTo = from + 2 + (selectedText || "リスト項目").length;
        break;
      case "ol":
        insert = `1. ${selectedText || "リスト項目"}`;
        newFrom = from + 3;
        newTo = from + 3 + (selectedText || "リスト項目").length;
        break;
      case "task":
        insert = `- [ ] ${selectedText || "タスク"}`;
        newFrom = from + 6;
        newTo = from + 6 + (selectedText || "タスク").length;
        break;
      case "quote":
        insert = `> ${selectedText || "引用テキスト"}`;
        newFrom = from + 2;
        newTo = from + 2 + (selectedText || "引用テキスト").length;
        break;
      case "code":
        insert = `\`${selectedText || "コード"}\``;
        newFrom = from + 1;
        newTo = from + 1 + (selectedText || "コード").length;
        break;
      case "codeblock": {
        const lang = "language";
        insert = `\`\`\`${lang}\n${selectedText || ""}\n\`\`\``;
        newFrom = from + 3;
        newTo = from + 3 + lang.length;
        break;
      }
      case "link":
        insert = `[${selectedText || "リンクテキスト"}](url)`;
        newFrom = from + 1;
        newTo = from + 1 + (selectedText || "リンクテキスト").length;
        break;
      case "image":
        insert = `![${selectedText || "alt テキスト"}](url)`;
        newFrom = from + 2;
        newTo = from + 2 + (selectedText || "alt テキスト").length;
        break;
      case "table":
        insert = `| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| セル | セル | セル |`;
        newFrom = from;
        newTo = from + insert.length;
        break;
      case "hr":
        insert = `\n---\n`;
        newFrom = from + insert.length;
        newTo = from + insert.length;
        break;
      default:
        return;
    }

    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: newFrom, head: newTo },
    });
    view.focus();
  }, []);

  return (
    <div className="editor-container">
      <EditorToolbar onFormat={handleFormat} />
      <CodeMirror
        value={value}
        extensions={extensions}
        theme={theme === "dark" ? githubDark : githubLight}
        onChange={onChange}
        onCreateEditor={handleCreateEditor}
        height="100%"
        className="codemirror-wrapper"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          searchKeymap: true,
        }}
      />
    </div>
  );
}
