import { test, expect } from "@playwright/test";

test.describe("設定モーダル", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("初期状態では設定モーダルが表示されない", async ({ page }) => {
    await expect(page.getByTestId("settings-modal")).not.toBeVisible();
  });

  test("設定ボタンをクリックするとモーダルが開く", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await expect(page.getByTestId("settings-modal")).toBeVisible();
  });

  test("閉じるボタンでモーダルが閉じる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await expect(page.getByTestId("settings-modal")).toBeVisible();
    await page.getByTestId("settings-close-btn").click();
    await expect(page.getByTestId("settings-modal")).not.toBeVisible();
  });

  test("バックドロップクリックでモーダルが閉じる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await expect(page.getByTestId("settings-modal")).toBeVisible();
    await page.getByTestId("settings-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId("settings-modal")).not.toBeVisible();
  });

  test("Escapeキーでモーダルが閉じる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await expect(page.getByTestId("settings-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("settings-modal")).not.toBeVisible();
  });

  test("キーバインドをVimに変更できる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await page.getByTestId("keymap-vim-btn").click();
    await expect(page.getByTestId("keymap-vim-btn")).toHaveClass(/active/);
    await expect(page.getByTestId("keymap-default-btn")).not.toHaveClass(/active/);
  });

  test("キーバインドをEmacsに変更できる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await page.getByTestId("keymap-emacs-btn").click();
    await expect(page.getByTestId("keymap-emacs-btn")).toHaveClass(/active/);
  });

  test("キーバインドをデフォルトに戻せる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await page.getByTestId("keymap-vim-btn").click();
    await page.getByTestId("keymap-default-btn").click();
    await expect(page.getByTestId("keymap-default-btn")).toHaveClass(/active/);
  });

  test("自動保存の設定をOFFに変更できる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await page.getByTestId("autosave-0-btn").click();
    await expect(page.getByTestId("autosave-0-btn")).toHaveClass(/active/);
  });

  test("スクロール同期チェックボックスを操作できる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    const checkbox = page.getByTestId("scroll-sync-checkbox");
    const initialChecked = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!initialChecked);
  });

  test("目次(TOC)チェックボックスを操作できる", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    const checkbox = page.getByTestId("toc-open-checkbox");
    const initialChecked = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!initialChecked);
  });

  test("設定がページ再読み込み後も維持される", async ({ page }) => {
    await page.getByTestId("settings-btn").click();
    await page.getByTestId("keymap-vim-btn").click();
    await page.getByTestId("settings-close-btn").click();

    await page.reload();

    await page.getByTestId("settings-btn").click();
    await expect(page.getByTestId("keymap-vim-btn")).toHaveClass(/active/);
  });
});
