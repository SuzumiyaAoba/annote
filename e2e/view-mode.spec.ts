import { test, expect } from "@playwright/test";
import { openFile } from "./helpers";

test.describe("ビューモード切り替え", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openFile(page, "note1.md");
  });

  test("ビューモード切り替えボタンが全て表示される", async ({ page }) => {
    await expect(page.getByTestId("view-mode-edit")).toBeVisible();
    await expect(page.getByTestId("view-mode-split")).toBeVisible();
    await expect(page.getByTestId("view-mode-preview")).toBeVisible();
  });

  test("編集モードに切り替えられる", async ({ page }) => {
    await page.getByTestId("view-mode-edit").click();
    await expect(page.getByTestId("editor-pane")).toBeVisible();
    await expect(page.getByTestId("preview-pane")).not.toBeVisible();
  });

  test("プレビューモードに切り替えられる", async ({ page }) => {
    await page.getByTestId("view-mode-preview").click();
    await expect(page.getByTestId("preview-pane")).toBeVisible();
    await expect(page.getByTestId("editor-pane")).not.toBeVisible();
  });

  test("分割モードに切り替えられる", async ({ page }) => {
    await page.getByTestId("view-mode-edit").click();
    await page.getByTestId("view-mode-split").click();
    await expect(page.getByTestId("editor-pane")).toBeVisible();
    await expect(page.getByTestId("preview-pane")).toBeVisible();
  });

  test("編集モードボタンがアクティブになる", async ({ page }) => {
    await page.getByTestId("view-mode-edit").click();
    await expect(page.getByTestId("view-mode-edit")).toHaveClass(/active/);
    await expect(page.getByTestId("view-mode-split")).not.toHaveClass(/active/);
    await expect(page.getByTestId("view-mode-preview")).not.toHaveClass(/active/);
  });

  test("分割モードボタンがアクティブになる", async ({ page }) => {
    await page.getByTestId("view-mode-split").click();
    await expect(page.getByTestId("view-mode-split")).toHaveClass(/active/);
    await expect(page.getByTestId("view-mode-edit")).not.toHaveClass(/active/);
    await expect(page.getByTestId("view-mode-preview")).not.toHaveClass(/active/);
  });

  test("プレビューモードボタンがアクティブになる", async ({ page }) => {
    await page.getByTestId("view-mode-preview").click();
    await expect(page.getByTestId("view-mode-preview")).toHaveClass(/active/);
    await expect(page.getByTestId("view-mode-edit")).not.toHaveClass(/active/);
    await expect(page.getByTestId("view-mode-split")).not.toHaveClass(/active/);
  });

  test("プレビューにMarkdownが描画される", async ({ page }) => {
    await page.getByTestId("view-mode-preview").click();
    await expect(page.getByTestId("markdown-body")).toBeVisible();
    await expect(page.getByTestId("markdown-body").locator("h1")).toContainText("Hello");
  });
});
