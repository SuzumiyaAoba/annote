import { useState, useEffect, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark } from "@uiw/codemirror-theme-github";
import { LanguageDescription, LanguageSupport } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./SyntaxViewer.css";

interface SyntaxViewerProps {
  content: string;
  fileName: string;
}

export default function SyntaxViewer({ content, fileName }: SyntaxViewerProps) {
  const [langSupport, setLangSupport] = useState<LanguageSupport | null>(null);

  useEffect(() => {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

    // Markdown は lang-markdown で処理（コードブロック内ハイライト付き）
    if (ext === "md" || ext === "markdown") {
      setLangSupport(markdown({ base: markdownLanguage, codeLanguages: languages }));
      return;
    }

    const desc = LanguageDescription.matchFilename(languages, fileName);
    if (!desc) {
      setLangSupport(null);
      return;
    }

    if (desc.support) {
      setLangSupport(desc.support);
    } else {
      desc.load().then(setLangSupport);
    }
  }, [fileName]);

  const extensions = useMemo(
    () => [
      EditorView.lineWrapping,
      EditorState.readOnly.of(true),
      ...(langSupport ? [langSupport] : []),
    ],
    [langSupport]
  );

  return (
    <div className="syntax-viewer">
      <div className="syntax-viewer-lang-label">
        {getLangLabel(fileName)}
      </div>
      <CodeMirror
        value={content}
        extensions={extensions}
        theme={githubDark}
        readOnly
        height="100%"
        className="syntax-viewer-cm"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
        }}
      />
    </div>
  );
}

function getLangLabel(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const labels: Record<string, string> = {
    md: "Markdown", markdown: "Markdown",
    ts: "TypeScript", tsx: "TypeScript (JSX)",
    js: "JavaScript", jsx: "JavaScript (JSX)",
    rs: "Rust", py: "Python", go: "Go",
    json: "JSON", toml: "TOML", yaml: "YAML", yml: "YAML",
    html: "HTML", css: "CSS", scss: "SCSS",
    sh: "Shell", bash: "Shell",
    sql: "SQL", xml: "XML",
    c: "C", cpp: "C++", java: "Java", kt: "Kotlin",
    rb: "Ruby", swift: "Swift",
  };
  return labels[ext] ?? (ext.toUpperCase() || "Plain Text");
}
