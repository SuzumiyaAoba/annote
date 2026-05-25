import { test, expect } from "@playwright/test";

test.describe("アプリの基本構造", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("アプリが正常にレンダリングされる", async ({ page }) => {
    await expect(page.getByTestId("app")).toBeVisible();
  });

  test("ツールバーが表示される", async ({ page }) => {
    await expect(page.getByTestId("toolbar")).toBeVisible();
  });

  test("サイドバーが表示される", async ({ page }) => {
    await expect(page.getByTestId("sidebar")).toBeVisible();
  });

  test("メインレイアウトが表示される", async ({ page }) => {
    await expect(page.getByTestId("main-layout")).toBeVisible();
  });

  test("フォルダが未開のときは空の状態が表示される", async ({ page }) => {
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("フォルダが未開のとき「フォルダを開く」メッセージが表示される", async ({ page }) => {
    await expect(page.getByTestId("empty-state-message")).toContainText(
      "「フォルダを開く」からノートフォルダを選択してください",
    );
  });

  test("ツールバーの「フォルダを開く」ボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("open-folder-btn")).toBeVisible();
  });

  test("ビューモード切り替えボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("view-mode-edit")).toBeVisible();
    await expect(page.getByTestId("view-mode-split")).toBeVisible();
    await expect(page.getByTestId("view-mode-preview")).toBeVisible();
  });

  test("テーマ切り替えボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("theme-toggle-btn")).toBeVisible();
  });

  test("設定ボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("settings-btn")).toBeVisible();
  });

  test("ファイル未選択時は保存ボタンが表示されない", async ({ page }) => {
    await expect(page.getByTestId("save-btn")).not.toBeVisible();
  });

  test("ファイル未選択時はエクスポートメニューが表示されない", async ({ page }) => {
    await expect(page.getByTestId("export-menu")).not.toBeVisible();
  });

  test("ファイル未選択時はステータスバーが表示されない", async ({ page }) => {
    await expect(page.getByTestId("status-bar")).not.toBeVisible();
  });

  test("タブバーが表示されない（ファイルなし）", async ({ page }) => {
    await expect(page.getByTestId("tab-bar")).not.toBeVisible();
  });
});
