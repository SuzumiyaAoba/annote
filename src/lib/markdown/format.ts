/**
 * Markdown フォーマットツールバーのアクション定義と、選択テキストへの適用ロジック。
 *
 * 各フォーマッタは「選択中のテキスト」を受け取り、挿入文字列と、
 * 挿入文字列先頭からの相対的な選択範囲（プレースホルダー部分）を返す。
 * エディタ側はこのオフセットに挿入位置を足してカーソル/選択を復元する。
 */

export type FormatAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "task"
  | "quote"
  | "code"
  | "codeblock"
  | "link"
  | "image"
  | "hr"
  | "table";

export interface FormatResult {
  /** 選択範囲を置き換える挿入テキスト。 */
  insert: string;
  /** 挿入テキスト先頭からの選択開始オフセット。 */
  selectionStart: number;
  /** 挿入テキスト先頭からの選択終了オフセット。 */
  selectionEnd: number;
}

type Formatter = (selected: string) => FormatResult;

/** 選択範囲を prefix / suffix で囲む（例: `**bold**`）。 */
function wrap(prefix: string, placeholder: string, suffix = prefix): Formatter {
  return (selected) => {
    const inner = selected || placeholder;
    return {
      insert: `${prefix}${inner}${suffix}`,
      selectionStart: prefix.length,
      selectionEnd: prefix.length + inner.length,
    };
  };
}

/** 行頭に prefix を付ける（例: `# 見出し`, `- リスト`）。 */
function linePrefix(prefix: string, placeholder: string): Formatter {
  return (selected) => {
    const inner = selected || placeholder;
    return {
      insert: `${prefix}${inner}`,
      selectionStart: prefix.length,
      selectionEnd: prefix.length + inner.length,
    };
  };
}

/** `[text](url)` / `![alt](url)` 形式。選択範囲を text 部分に置く。 */
function linkLike(prefix: string, placeholder: string): Formatter {
  return (selected) => {
    const inner = selected || placeholder;
    return {
      insert: `${prefix}${inner}](url)`,
      selectionStart: prefix.length,
      selectionEnd: prefix.length + inner.length,
    };
  };
}

const FORMATTERS: Record<FormatAction, Formatter> = {
  bold: wrap("**", "太字テキスト"),
  italic: wrap("*", "斜体テキスト"),
  strikethrough: wrap("~~", "テキスト"),
  code: wrap("`", "コード"),

  h1: linePrefix("# ", "見出し 1"),
  h2: linePrefix("## ", "見出し 2"),
  h3: linePrefix("### ", "見出し 3"),
  ul: linePrefix("- ", "リスト項目"),
  ol: linePrefix("1. ", "リスト項目"),
  task: linePrefix("- [ ] ", "タスク"),
  quote: linePrefix("> ", "引用テキスト"),

  link: linkLike("[", "リンクテキスト"),
  image: linkLike("![", "alt テキスト"),

  codeblock: (selected) => {
    const lang = "language";
    return {
      insert: `\`\`\`${lang}\n${selected}\n\`\`\``,
      selectionStart: 3,
      selectionEnd: 3 + lang.length,
    };
  },

  table: () => {
    const insert = `| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| セル | セル | セル |`;
    return { insert, selectionStart: 0, selectionEnd: insert.length };
  },

  hr: () => {
    const insert = `\n---\n`;
    return { insert, selectionStart: insert.length, selectionEnd: insert.length };
  },
};

/** 指定アクションを選択テキストに適用した結果を返す。 */
export function applyFormat(action: FormatAction, selected: string): FormatResult {
  return FORMATTERS[action](selected);
}
