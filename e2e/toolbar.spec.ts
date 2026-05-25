import { test, expect } from "@playwright/test";
import { openFile, setupMocks, DEFAULT_FOLDER, DEFAULT_FILES, DEFAULT_DIR_PATHS } from "./helpers";

test.describe("ツールバー", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("フォルダを開くボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("open-folder-btn")).toBeVisible();
    await expect(page.getByTestId("open-folder-btn")).toContainText("フォルダを開く");
  });

  test("ビューモード切り替えボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("view-mode-toggle")).toBeVisible();
  });

  test("ファイルを開いていないときは保存ボタンが表示されない", async ({ page }) => {
    await expect(page.getByTestId("save-btn")).not.toBeVisible();
  });

  test("ファイルを開くと保存ボタンが表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("save-btn")).toBeVisible();
  });

  test("変更がないとき保存ボタンは無効化される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("save-btn")).toBeDisabled();
  });

  test("変更があるとき保存ボタンが有効になる", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("view-mode-edit").click();
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" test");
    await expect(page.getByTestId("save-btn")).toBeEnabled();
  });

  test("ファイル選択後にファイル名がツールバーに表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("file-name")).toBeVisible();
    await expect(page.getByTestId("file-name")).toContainText("note1.md");
  });

  test("設定ボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("settings-btn")).toBeVisible();
  });

  test("テーマ切り替えボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("theme-toggle-btn")).toBeVisible();
  });

  test("Cmd+Sで保存できる（変更あり）", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("view-mode-edit").click();
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" test");
    await expect(page.getByTestId("save-btn")).toBeEnabled();
    await page.getByTestId("app").press("Meta+s");
    await expect(page.getByTestId("tab-dirty")).not.toBeVisible();
  });

  test("フォルダを開くとサイドバーのフォルダ名が更新される", async ({ page }) => {
    await setupMocks(page, {
      folderPath: DEFAULT_FOLDER,
      files: DEFAULT_FILES,
      dirPaths: DEFAULT_DIR_PATHS,
    });
    await page.getByTestId("open-folder-btn").click();
    await page.waitForSelector('[data-testid="folder-name-text"]');
    await expect(page.getByTestId("folder-name-text")).toContainText("notes");
  });
});
