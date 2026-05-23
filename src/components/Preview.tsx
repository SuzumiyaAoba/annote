import { useState, useEffect, useId, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { load as parseYaml } from "js-yaml";
import mermaid from "mermaid";
import { openUrl } from "@tauri-apps/plugin-opener";
import { convertFileSrc } from "@tauri-apps/api/core";
import "katex/dist/katex.min.css";
import "github-markdown-css/github-markdown-light.css";
import "../styles/github-markdown-dark-scoped.css";
import "highlight.js/styles/github.css";
import "../styles/hljs-github-dark-scoped.css";
import "./Preview.css";
import Toc, { extractHeadings } from "./Preview/Toc";
import { useSettingsStore } from "../stores/settingsStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

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
  const tocOpen = useSettingsStore((s) => s.tocOpen);
  const folderPath = useWorkspaceStore((s) => s.folderPath);
  const bodyRef = useRef<HTMLDivElement>(null);

  const headings = useMemo(() => extractHeadings(body), [body]);

  const resolveImageSrc = useMemo(() => {
    return (src: string) => {
      if (!src || /^https?:\/\//.test(src) || src.startsWith("data:")) return src;
      if (folderPath) {
        return convertFileSrc(`${folderPath}/${src}`);
      }
      return src;
    };
  }, [folderPath]);

  const headingCounters = useRef<Record<string, number>>({});

  const components = useMemo<Components>(() => {
    headingCounters.current = {};
    const makeHeading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
      function Heading({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
        const text = String(children ?? "")
          .replace(/[*_`~\[\]]/g, "")
          .trim();
        const baseId = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w　-鿿-]/g, "");
        headingCounters.current[baseId] = (headingCounters.current[baseId] ?? 0) + 1;
        const count = headingCounters.current[baseId];
        const id = count > 1 ? `${baseId}-${count}` : baseId;
        return (
          <Tag {...props} id={id} data-heading-id={id}>
            {children}
          </Tag>
        );
      };

    return {
      h1: makeHeading("h1"),
      h2: makeHeading("h2"),
      h3: makeHeading("h3"),
      h4: makeHeading("h4"),
      a({ href, children, ...props }) {
        const isExternal = href && /^https?:\/\//.test(href);
        if (isExternal) {
          return (
            <a
              {...props}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                openUrl(href).catch(console.error);
              }}
            >
              {children}
            </a>
          );
        }
        return <a href={href} {...props}>{children}</a>;
      },
      img({ src, alt, ...props }) {
        const resolved = src ? resolveImageSrc(src) : src;
        return <img {...props} src={resolved} alt={alt} />;
      },
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
        if (lang === "tikz") {
          return <TikzDiagram code={String(children).replace(/\n$/, "")} />;
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    };
  }, [theme, resolveImageSrc]);

  return (
    <div className="preview-outer">
      <div className="preview-container" ref={bodyRef}>
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
      {tocOpen && headings.length > 0 && (
        <Toc headings={headings} previewRef={bodyRef} />
      )}
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

function TikzDiagram({ code }: { code: string }) {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setSvgHtml("");
    setError("");
    setLoading(true);

    // tikzjax はページロード時に <script type="text/tikz"> を処理するため、
    // srcdoc iframe でその通常フローを再現する。srcdoc は親と同一オリジンになるので
    // contentDocument へのアクセスが可能。
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:800px;height:600px;border:none";
    document.body.appendChild(iframe);

    // TikZ ソース内の </script を保護 (HTML パーサーがスクリプト要素を閉じるのを防ぐ)
    const safeCode = code.replace(/<\/script/gi, "< /script");

    iframe.srcdoc = [
      "<!DOCTYPE html><html><head>",
      '<link rel="stylesheet" href="https://tikzjax.com/v1/fonts.css">',
      "</head><body>",
      `<script type="text/tikz">${safeCode}</script>`,
      '<script src="https://tikzjax.com/v1/tikzjax.js"></script>',
      "</body></html>",
    ].join("\n");

    const timeoutId = setTimeout(() => {
      clearInterval(pollId);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      if (!cancelled) {
        setError("タイムアウト: TikZ のレンダリングが完了しませんでした");
        setLoading(false);
      }
    }, 60_000);

    const pollId = setInterval(() => {
      if (cancelled) { clearInterval(pollId); return; }
      try {
        const svg = iframe.contentDocument?.querySelector("svg");
        if (svg) {
          clearInterval(pollId);
          clearTimeout(timeoutId);
          if (!cancelled) {
            // tikzjax が付与する position: absolute 等を除去して inline に戻す
            const clone = svg.cloneNode(true) as SVGElement;
            for (const prop of ["position", "left", "top", "right", "bottom"]) {
              clone.style.removeProperty(prop);
            }
            setSvgHtml(clone.outerHTML);
            setLoading(false);
          }
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }
      } catch { /* cross-origin access error */ }
    }, 500);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      clearTimeout(timeoutId);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    };
  }, [code]);

  if (loading) {
    return <div className="tikz-loading">TikZ をレンダリング中…</div>;
  }
  if (error) {
    return (
      <div className="tikz-error">
        <pre><code>{code}</code></pre>
        <p className="tikz-error-msg">{error}</p>
      </div>
    );
  }
  return (
    <div className="tikz-diagram" dangerouslySetInnerHTML={{ __html: svgHtml }} />
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
