interface TauriMocks {
  openResult?: string | null;
  saveResult?: string | null;
  files?: Record<string, string>;
  dirPaths?: string[];
}

declare global {
  interface Window {
    __TAURI_MOCKS__?: TauriMocks;
  }
}

export {};
