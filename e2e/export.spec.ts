import { test, expect } from "@playwright/test";
import { openFile } from "./helpers";

test.describe("エクスポートメニュー", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ファイルが未開のときはエクスポートボタンが表示されない", async ({ page }) => {
    await expect(page.getByTestId("export-menu")).not.toBeVisible();
  });

  test("ファイルを開くとエクスポートボタンが表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("export-menu")).toBeVisible();
    await expect(page.getByTestId("export-menu-btn")).toBeVisible();
  });

  test("エクスポートボタンをクリックするとドロップダウンが開く", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("export-menu-btn").click();
    await expect(page.getByTestId("export-dropdown")).toBeVisible();
  });

  test("ドロップダウンにHTMLエクスポートオプションがある", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("export-menu-btn").click();
    await expect(page.getByTestId("export-html-btn")).toBeVisible();
    await expect(page.getByTestId("export-html-btn")).toContainText("HTML として書き出し");
  });

  test("ドロップダウンに印刷オプションがある", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("export-menu-btn").click();
    await expect(page.getByTestId("export-print-btn")).toBeVisible();
    await expect(page.getByTestId("export-print-btn")).toContainText("印刷 / PDF に保存");
  });

  test("バックドロップクリックでドロップダウンが閉じる", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("export-menu-btn").click();
    await expect(page.getByTestId("export-dropdown")).toBeVisible();
    await page.getByTestId("export-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId("export-dropdown")).not.toBeVisible();
  });
});
