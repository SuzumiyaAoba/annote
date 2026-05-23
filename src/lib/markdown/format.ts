export function wrapSelection(
  text: string,
  from: number,
  to: number,
  wrapper: string,
): { text: string; from: number; to: number } {
  const selected = text.slice(from, to);
  const wrapped = `${wrapper}${selected}${wrapper}`;
  return {
    text: text.slice(0, from) + wrapped + text.slice(to),
    from: from + wrapper.length,
    to: to + wrapper.length,
  };
}

export function toggleLinePrefix(line: string, prefix: string): string {
  return line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
}

export function wrapBlock(
  text: string,
  from: number,
  to: number,
  block: string,
): { text: string; from: number; to: number } {
  const selected = text.slice(from, to) || "";
  const wrapped = `${block}${selected}${block}`;
  return {
    text: text.slice(0, from) + wrapped + text.slice(to),
    from: from + block.length,
    to: from + block.length + selected.length,
  };
}
