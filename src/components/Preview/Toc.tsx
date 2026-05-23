import "./Toc.css";

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split("\n");
  const counters: Record<string, number> = {};
  // Track fence character and minimum closing length separately so that
  // a backtick fence is never closed by a tilde line and vice versa (CommonMark §4.5).
  let fenceChar: string | null = null;
  let fenceLen = 0;
  return lines
    .map((line) => {
      // CommonMark allows 0–3 spaces before a fence; 4+ spaces = indented code block (not a fence).
      const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (fenceMatch) {
        const ch = fenceMatch[1][0];
        const len = fenceMatch[1].length;
        if (fenceChar === null) {
          fenceChar = ch;
          fenceLen = len;
        } else if (ch === fenceChar && len >= fenceLen) {
          fenceChar = null;
          fenceLen = 0;
        }
        return null;
      }
      if (fenceChar !== null) return null;
      const trimmed = line.trim();
      const match = /^(#{1,4})\s+(.+)$/.exec(trimmed);
      if (!match) return null;
      const level = match[1].length;
      const text = match[2].replace(/[*_`~[\]]/g, "").trim();
      const baseId = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w　-鿿-]/g, "");
      counters[baseId] = (counters[baseId] ?? 0) + 1;
      const count = counters[baseId];
      const id = count > 1 ? `${baseId}-${count}` : baseId;
      return { level, text, id };
    })
    .filter((h): h is TocHeading => h !== null);
}

interface TocProps {
  headings: TocHeading[];
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export default function Toc({ headings, previewRef }: TocProps) {
  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const container = previewRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-heading-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="toc">
      <div className="toc-title">目次</div>
      <ul className="toc-list">
        {headings.map((h, i) => (
          <li
            key={i}
            className="toc-item"
            style={{ paddingLeft: `${(h.level - minLevel) * 12}px` }}
          >
            <button className="toc-link" title={h.text} onClick={() => handleClick(h.id)}>
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
