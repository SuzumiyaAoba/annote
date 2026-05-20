import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import "./Editor.css";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: "dark" | "light";
}

const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
];

export default function Editor({ value, onChange, theme }: EditorProps) {
  return (
    <div className="editor-container">
      <CodeMirror
        value={value}
        extensions={extensions}
        theme={theme === "dark" ? githubDark : githubLight}
        onChange={onChange}
        height="100%"
        className="codemirror-wrapper"
        basicSetup={{
          lineNumbers: false,
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
