import { useCallback, useMemo, useRef } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { foldGutter, codeFolding } from "@codemirror/language";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { autocompletion } from "@codemirror/autocomplete";
import { vim } from "./Editor/extensions/vim";
import { emacs } from "./Editor/extensions/emacs";
import EditorToolbar from "./Editor/EditorToolbar";
import { applyFormat, type FormatAction } from "../lib/markdown/format";
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

    const { from, to } = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(from, to);
    const { insert, selectionStart, selectionEnd } = applyFormat(action, selectedText);

    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + selectionStart, head: from + selectionEnd },
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
