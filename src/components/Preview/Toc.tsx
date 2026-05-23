import "./Toc.css";

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split("\n");
  return lines
    .map((line) => {
      const match = /^(#{1,4})\s+(.+)$/.exec(line.trim());
      if (!match) return null;
      const level = match[1].length;
      const text = match[2].replace(/[*_`~\[\]]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w　-鿿-]/g, "");
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
            <button
              className="toc-link"
              title={h.text}
              onClick={() => handleClick(h.id)}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
