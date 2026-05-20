import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { load as parseYaml } from "js-yaml";
import "github-markdown-css/github-markdown-light.css";
import "../styles/github-markdown-dark-scoped.css";
import "highlight.js/styles/github.css";
import "../styles/hljs-github-dark-scoped.css";
import "./Preview.css";

interface PreviewProps {
  content: string;
}

export default function Preview({ content }: PreviewProps) {
  const { data: frontmatter, body } = parseFrontmatter(content);
  const hasFrontmatter = Object.keys(frontmatter).length > 0;

  return (
    <div className="preview-container">
      {hasFrontmatter && <FrontmatterTable data={frontmatter} />}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {body}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
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
