import { test, expect } from "@playwright/test";
import { openFolder, openFile } from "./helpers";

test.describe("タブ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ファイルが未開のときはタブバーが表示されない", async ({ page }) => {
    await expect(page.getByTestId("tab-bar")).not.toBeVisible();
  });

  test("ファイルを開くとタブが表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("tab-bar")).toBeVisible();
    await expect(page.getByTestId("tab-item")).toBeVisible();
  });

  test("タブにファイル名が表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("tab-label").first()).toContainText("note1.md");
  });

  test("タブの×ボタンで閉じられる", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("tab-item")).toBeVisible();
    await page.getByTestId("tab-close-btn").click();
    await expect(page.getByTestId("tab-bar")).not.toBeVisible();
  });

  test("複数のファイルを開くと複数タブが表示される", async ({ page }) => {
    await openFolder(page);
    await page.getByRole("treeitem", { name: "note1.md" }).click();
    await page.waitForSelector('[data-testid="tab-bar"]');
    await page.getByRole("treeitem", { name: "note2.md" }).click();
    const tabs = page.getByTestId("tab-item");
    await expect(tabs).toHaveCount(2);
  });

  test("同じファイルを2回開いても重複タブにならない", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByRole("treeitem", { name: "note1.md" }).click();
    const tabs = page.getByTestId("tab-item");
    await expect(tabs).toHaveCount(1);
  });

  test("タブをクリックするとアクティブになる", async ({ page }) => {
    await openFolder(page);
    await page.getByRole("treeitem", { name: "note1.md" }).click();
    await page.waitForSelector('[data-testid="tab-bar"]');
    await page.getByRole("treeitem", { name: "note2.md" }).click();
    await page.waitForSelector('[data-tab-path="note2.md"]');

    const firstTab = page.getByTestId("tab-item").first();
    await firstTab.click();
    await expect(firstTab).toHaveAttribute("data-active", "true");
  });

  test("ファイルを開くとエディタに内容が表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("view-mode-edit").click();
    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();
  });

  test("エディタで内容を編集するとダーティインジケーターが表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await page.getByTestId("view-mode-edit").click();
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" test");
    await expect(page.getByTestId("tab-dirty")).toBeVisible();
  });

  test("ファイルを開いた直後はダーティインジケーターが表示されない", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("tab-dirty")).not.toBeVisible();
  });
});
