import { test, expect } from "@playwright/test";
import { setupMocks, DEFAULT_FOLDER, DEFAULT_FILES, DEFAULT_DIR_PATHS, openFolder } from "./helpers";

test.describe("サイドバー", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("フォルダ未選択時はサイドバーに「フォルダを開く」ボタンが表示される", async ({
    page,
  }) => {
    await expect(page.getByTestId("sidebar-open-folder-btn")).toBeVisible();
  });

  test("フォルダを開くとフォルダ名が表示される", async ({ page }) => {
    await setupMocks(page, {
      folderPath: DEFAULT_FOLDER,
      files: DEFAULT_FILES,
      dirPaths: DEFAULT_DIR_PATHS,
    });
    await page.getByTestId("open-folder-btn").click();
    await expect(page.getByTestId("folder-name-text")).toBeVisible();
    await expect(page.getByTestId("folder-name-text")).toContainText("notes");
  });

  test("フォルダを開くとファイルツリーが表示される", async ({ page }) => {
    await openFolder(page);
    await expect(page.getByTestId("sidebar-tree")).toBeVisible();
    await expect(page.getByRole("treeitem", { name: "note1.md" })).toBeVisible();
  });

  test("フォルダを開くと新規ファイルボタンが表示される", async ({ page }) => {
    await openFolder(page);
    await expect(page.getByTestId("new-file-btn")).toBeVisible();
  });

  test("フォルダを開くと新規フォルダボタンが表示される", async ({ page }) => {
    await openFolder(page);
    await expect(page.getByTestId("new-folder-btn")).toBeVisible();
  });

  test("ファイルを選択するとリネーム・削除ボタンが表示される", async ({ page }) => {
    await openFolder(page);
    await page.getByRole("treeitem", { name: "note1.md" }).click();
    await page.waitForSelector('[data-testid="tab-bar"]');
    await expect(page.getByTestId("rename-btn")).toBeVisible();
    await expect(page.getByTestId("delete-btn")).toBeVisible();
  });

  test("ファイルが未選択のときはリネーム・削除ボタンが表示されない", async ({ page }) => {
    await openFolder(page);
    await expect(page.getByTestId("rename-btn")).not.toBeVisible();
    await expect(page.getByTestId("delete-btn")).not.toBeVisible();
  });

  test("新規ファイルボタンをクリックするとプロンプトモーダルが表示される", async ({ page }) => {
    await openFolder(page);
    await page.getByTestId("new-file-btn").click();
    await expect(page.getByTestId("prompt-modal")).toBeVisible();
    await expect(page.getByTestId("prompt-message")).toContainText("新規ファイル名");
  });

  test("プロンプトモーダルのキャンセルボタンで閉じられる", async ({ page }) => {
    await openFolder(page);
    await page.getByTestId("new-file-btn").click();
    await expect(page.getByTestId("prompt-modal")).toBeVisible();
    await page.getByTestId("prompt-cancel-btn").click();
    await expect(page.getByTestId("prompt-modal")).not.toBeVisible();
  });

  test("プロンプトモーダルのバックドロップクリックで閉じられる", async ({ page }) => {
    await openFolder(page);
    await page.getByTestId("new-file-btn").click();
    await expect(page.getByTestId("prompt-modal")).toBeVisible();
    await page.getByTestId("prompt-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId("prompt-modal")).not.toBeVisible();
  });

  test("Escapeキーでプロンプトモーダルが閉じられる", async ({ page }) => {
    await openFolder(page);
    await page.getByTestId("new-file-btn").click();
    await expect(page.getByTestId("prompt-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("prompt-modal")).not.toBeVisible();
  });

  test("新規ファイルをEnterで確定できる", async ({ page }) => {
    await openFolder(page);
    await page.getByTestId("new-file-btn").click();
    await page.getByTestId("prompt-input").fill("new-note");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("prompt-modal")).not.toBeVisible();
  });

  test("新規フォルダボタンをクリックするとプロンプトモーダルが表示される", async ({ page }) => {
    await openFolder(page);
    await page.getByTestId("new-folder-btn").click();
    await expect(page.getByTestId("prompt-modal")).toBeVisible();
    await expect(page.getByTestId("prompt-message")).toContainText("新規フォルダ名");
  });

  test("リネームボタンをクリックすると現在のファイル名がプロンプトに入力されている", async ({
    page,
  }) => {
    await openFolder(page);
    await page.getByRole("treeitem", { name: "note1.md" }).click();
    await page.waitForSelector('[data-testid="tab-bar"]');
    await page.getByTestId("rename-btn").click();
    await expect(page.getByTestId("prompt-modal")).toBeVisible();
    await expect(page.getByTestId("prompt-input")).toHaveValue("note1.md");
  });

  test("空のフォルダには「フォルダが空です」が表示される", async ({ page }) => {
    await setupMocks(page, { dirPaths: [] });
    await page.getByTestId("open-folder-btn").click();
    await page.waitForSelector('[data-testid="folder-name-text"]');
    await expect(page.getByTestId("empty-folder")).toBeVisible();
    await expect(page.getByTestId("empty-folder")).toContainText("フォルダが空です");
  });
});
