export async function open(_options?: unknown): Promise<string | null> {
  return window.__TAURI_MOCKS__?.openResult ?? null;
}

export async function save(_options?: unknown): Promise<string | null> {
  return window.__TAURI_MOCKS__?.saveResult ?? null;
}
