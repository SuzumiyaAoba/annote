export async function invoke(cmd: string, _args?: unknown): Promise<unknown> {
  if (cmd === "get_dir_paths") {
    const args = _args as { dirPath?: string } | undefined;
    const openResult = window.__TAURI_MOCKS__?.openResult;
    if (args?.dirPath && openResult && args.dirPath !== openResult) {
      return [];
    }
    return window.__TAURI_MOCKS__?.dirPaths ?? [];
  }
  throw new Error(`Mock: Unknown command: ${cmd}`);
}

export function convertFileSrc(filePath: string): string {
  return `asset://localhost/${filePath}`;
}
