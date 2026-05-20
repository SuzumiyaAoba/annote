import { useState, useEffect, useId, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { load as parseYaml } from "js-yaml";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";
import "github-markdown-css/github-markdown-light.css";
import "../styles/github-markdown-dark-scoped.css";
import "highlight.js/styles/github.css";
import "../styles/hljs-github-dark-scoped.css";
import "./Preview.css";

interface PreviewProps {
  content: string;
  theme: "dark" | "light";
}

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeHighlight, rehypeKatex];

const GITHUB_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

const MERMAID_CONFIG_LIGHT = {
  startOnLoad: false,
  theme: "base" as const,
  themeVariables: {
    // Nodes
    primaryColor: "#dff7ff",
    primaryTextColor: "#1f2328",
    primaryBorderColor: "#54aeff66",
    // Edges / lines
    lineColor: "#636c76",
    arrowheadColor: "#636c76",
    edgeLabelBackground: "#ffffff",
    // Secondary / cluster
    secondaryColor: "#f6f8fa",
    tertiaryColor: "#eaeef2",
    clusterBkg: "#f6f8fa",
    clusterBorder: "#d0d7de",
    // Global background & text
    background: "#ffffff",
    mainBkg: "#dff7ff",
    textColor: "#1f2328",
    titleColor: "#1f2328",
    labelColor: "#1f2328",
    // Sequence diagram
    noteBkgColor: "#fff8c5",
    noteTextColor: "#1f2328",
    noteBorderColor: "#d1d9e0",
    activationBorderColor: "#0969da",
    activationBkgColor: "#ddf4ff",
    // Gantt
    taskBorderColor: "#54aeff66",
    taskBkgColor: "#dff7ff",
    activeTaskBorderColor: "#0969da",
    activeTaskBkgColor: "#ddf4ff",
    critBorderColor: "#d1242f",
    critBkgColor: "#ffebe9",
    doneTaskBkgColor: "#f6f8fa",
    doneTaskBorderColor: "#d0d7de",
    // ER diagram
    attributeBackgroundColorEven: "#ffffff",
    attributeBackgroundColorOdd: "#f6f8fa",
    // Font
    fontFamily: GITHUB_FONT,
    fontSize: "14px",
  },
};

const MERMAID_CONFIG_DARK = {
  startOnLoad: false,
  darkMode: true,
  theme: "base" as const,
  themeVariables: {
    // Nodes
    primaryColor: "#12243f",
    primaryTextColor: "#e6edf3",
    primaryBorderColor: "#388bfd66",
    // Edges / lines
    lineColor: "#8b949e",
    arrowheadColor: "#8b949e",
    edgeLabelBackground: "#0d1117",
    // Secondary / cluster
    secondaryColor: "#161b22",
    tertiaryColor: "#21262d",
    clusterBkg: "#161b22",
    clusterBorder: "#3d444d",
    // Global background & text
    background: "#0d1117",
    mainBkg: "#12243f",
    textColor: "#e6edf3",
    titleColor: "#e6edf3",
    labelColor: "#e6edf3",
    // Sequence diagram
    noteBkgColor: "#bb800926",
    noteTextColor: "#e6edf3",
    noteBorderColor: "#3d444d",
    activationBorderColor: "#4493f8",
    activationBkgColor: "#121d2f",
    // Gantt
    taskBorderColor: "#388bfd66",
    taskBkgColor: "#12243f",
    activeTaskBorderColor: "#4493f8",
    activeTaskBkgColor: "#121d2f",
    critBorderColor: "#f85149",
    critBkgColor: "#67060c",
    doneTaskBkgColor: "#21262d",
    doneTaskBorderColor: "#3d444d",
    // ER diagram
    attributeBackgroundColorEven: "#0d1117",
    attributeBackgroundColorOdd: "#161b22",
    // Font
    fontFamily: GITHUB_FONT,
    fontSize: "14px",
  },
};

export default function Preview({ content, theme }: PreviewProps) {
  const { data: frontmatter, body } = parseFrontmatter(content);
  const hasFrontmatter = Object.keys(frontmatter).length > 0;

  const components = useMemo<Components>(
    () => ({
      code({ className, children, ...props }) {
        const lang = /language-(\w+)/.exec(className ?? "")?.[1];
        if (lang === "mermaid") {
          return (
            <MermaidDiagram
              code={String(children).replace(/\n$/, "")}
              theme={theme}
            />
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    [theme]
  );

  return (
    <div className="preview-container">
      {hasFrontmatter && <FrontmatterTable data={frontmatter} />}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
          components={components}
        >
          {body}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function MermaidDiagram({
  code,
  theme,
}: {
  code: string;
  theme: "dark" | "light";
}) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const uid = useId();
  const id = `mmd${uid.replace(/\W/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize(
      theme === "dark" ? MERMAID_CONFIG_DARK : MERMAID_CONFIG_LIGHT
    );

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(String(err));
          setSvg("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, theme, id]);

  if (error) {
    return (
      <pre className="mermaid-error">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, body: raw };
  try {
    const data = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
    return { data, body: raw.slice(match[0].length) };
  } catch {
    return { data: {}, body: raw };
  }
}

function FrontmatterTable({ data }: { data: Record<string, unknown> }) {
  return (
    <table className="frontmatter-table">
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{formatValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
