/**
 * ファイルパスを扱うためのユーティリティ群。
 *
 * このアプリのパスは常に "/" 区切りの相対/絶対パスで表現される。
 * ディレクトリは末尾に "/" を持つ場合がある（例: "foo/bar/"）。
 */

/** 末尾の "/" を取り除く（"foo/bar/" → "foo/bar"）。 */
export function stripTrailingSlash(path: string): string {
  return path.replace(/\/$/, "");
}

/** 末尾が "/" のディレクトリパスかどうか。 */
export function isDirPath(path: string): boolean {
  return path.endsWith("/");
}

/** パスの最後の要素（ファイル名・ディレクトリ名）を返す。 */
export function basename(path: string): string {
  const parts = stripTrailingSlash(path).split("/");
  return parts[parts.length - 1] ?? "";
}

/** 親ディレクトリのパスを返す（末尾 "/" なし）。トップレベルなら ""。 */
export function parentDir(path: string): string {
  const parts = stripTrailingSlash(path).split("/");
  parts.pop();
  return parts.join("/");
}

/** 親ディレクトリ内の名前を newName に置き換えたパスを返す。 */
export function replaceBasename(path: string, newName: string): string {
  const dir = parentDir(path);
  return dir ? `${dir}/${newName}` : newName;
}

/** "/" を重複させずにパスを結合する。空セグメントは無視する。 */
export function joinPath(...segments: (string | null | undefined)[]): string {
  return segments
    .filter((s): s is string => Boolean(s))
    .map((s) => stripTrailingSlash(s))
    .filter(Boolean)
    .join("/");
}

/** 拡張子（小文字・ドットなし）を返す。拡張子がなければ ""。 */
export function extension(path: string): string {
  const name = basename(path);
  const dotIdx = name.lastIndexOf(".");
  return dotIdx > 0 ? name.slice(dotIdx + 1).toLowerCase() : "";
}

const MARKDOWN_EXT_RE = /\.(md|markdown)$/i;

/** Markdown ファイルのパスかどうか。 */
export function isMarkdownPath(path: string): boolean {
  return MARKDOWN_EXT_RE.test(path);
}

/** Markdown の拡張子を取り除いたパスを返す。 */
export function stripMarkdownExt(path: string): string {
  return path.replace(MARKDOWN_EXT_RE, "");
}
