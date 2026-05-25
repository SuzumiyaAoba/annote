export async function readTextFile(path: string): Promise<string> {
  const files = window.__TAURI_MOCKS__?.files ?? {};
  if (path in files) return files[path];
  throw new Error(`Mock: File not found: ${path}`);
}

export async function writeTextFile(path: string, content: string): Promise<void> {
  if (!window.__TAURI_MOCKS__) window.__TAURI_MOCKS__ = {};
  if (!window.__TAURI_MOCKS__.files) window.__TAURI_MOCKS__.files = {};
  window.__TAURI_MOCKS__.files[path] = content;
}

function toRelative(absolutePath: string): string {
  const base = window.__TAURI_MOCKS__?.openResult ?? "";
  if (base && absolutePath.startsWith(base + "/")) {
    return absolutePath.slice(base.length + 1);
  }
  return absolutePath;
}

export async function mkdir(path: string, _options?: unknown): Promise<void> {
  if (!window.__TAURI_MOCKS__) return;
  const rel = toRelative(path) + "/";
  const paths = window.__TAURI_MOCKS__.dirPaths;
  if (paths && !paths.includes(rel)) {
    window.__TAURI_MOCKS__.dirPaths = [...paths, rel];
  }
}

export async function rename(oldPath: string, newPath: string): Promise<void> {
  if (!window.__TAURI_MOCKS__) return;
  const files = window.__TAURI_MOCKS__.files;
  if (files && oldPath in files) {
    files[newPath] = files[oldPath];
    delete files[oldPath];
  }
  const oldRel = toRelative(oldPath);
  const newRel = toRelative(newPath);
  const paths = window.__TAURI_MOCKS__.dirPaths;
  if (paths) {
    window.__TAURI_MOCKS__.dirPaths = paths.map((p) => (p === oldRel ? newRel : p));
  }
}

export async function remove(path: string, options?: unknown): Promise<void> {
  if (!window.__TAURI_MOCKS__) return;
  const recursive = (options as { recursive?: boolean } | undefined)?.recursive;
  const rel = toRelative(path);
  const files = window.__TAURI_MOCKS__.files;
  if (files) {
    if (recursive) {
      const prefix = path + "/";
      for (const key of Object.keys(files)) {
        if (key === path || key.startsWith(prefix)) {
          delete files[key];
        }
      }
    } else {
      delete files[path];
    }
  }
  const paths = window.__TAURI_MOCKS__.dirPaths;
  if (paths) {
    const relPrefix = rel + "/";
    window.__TAURI_MOCKS__.dirPaths = paths.filter((p) =>
      recursive ? p !== rel && p !== rel + "/" && !p.startsWith(relPrefix) : p !== rel,
    );
  }
}
