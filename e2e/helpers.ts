import { Page } from "@playwright/test";

export interface MockConfig {
  folderPath?: string;
  files?: Record<string, string>;
  dirPaths?: string[];
}

export const DEFAULT_FOLDER = "/mock/notes";
export const DEFAULT_FILES: Record<string, string> = {
  "/mock/notes/note1.md": "# Hello\n\nThis is a test note.\n\nSome content here.",
  "/mock/notes/note2.md": "# World\n\nAnother note.",
  "/mock/notes/sub/nested.md": "# Nested\n\nNested file.",
};
export const DEFAULT_DIR_PATHS = ["note1.md", "note2.md", "sub/", "sub/nested.md"];

export async function setupMocks(page: Page, config: MockConfig = {}) {
  const {
    folderPath = DEFAULT_FOLDER,
    files = DEFAULT_FILES,
    dirPaths = DEFAULT_DIR_PATHS,
  } = config;

  await page.evaluate(
    ({ folderPath, files, dirPaths }) => {
      window.__TAURI_MOCKS__ = {
        openResult: folderPath,
        saveResult: "/tmp/export.html",
        files,
        dirPaths,
      };
    },
    { folderPath, files, dirPaths },
  );
}

export async function openFolder(page: Page, config: MockConfig = {}) {
  await setupMocks(page, config);
  await page.click('[data-testid="open-folder-btn"]');
  await page.waitForSelector('[data-testid="folder-name-text"]');
}

export async function openFile(page: Page, fileName: string, config: MockConfig = {}) {
  await openFolder(page, config);
  // @pierre/trees renders items with role="treeitem" and aria-label set to filename
  await page.getByRole("treeitem", { name: fileName }).click();
  await page.waitForSelector(`[data-tab-path="${fileName}"]`);
}

export async function clearAppState(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    window.__TAURI_MOCKS__ = undefined;
  });
  await page.reload();
}
