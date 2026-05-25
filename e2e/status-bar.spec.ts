import { test, expect } from "@playwright/test";
import { openFile, DEFAULT_FOLDER } from "./helpers";

test.describe("ステータスバー", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ファイルが未開のときはステータスバーが表示されない", async ({ page }) => {
    await expect(page.getByTestId("status-bar")).not.toBeVisible();
  });

  test("ファイルを開くとステータスバーが表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("status-bar")).toBeVisible();
  });

  test("行数が表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("status-lines")).toBeVisible();
    await expect(page.getByTestId("status-lines")).toContainText("行");
  });

  test("単語数が表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("status-words")).toBeVisible();
    await expect(page.getByTestId("status-words")).toContainText("語");
  });

  test("文字数が表示される", async ({ page }) => {
    await openFile(page, "note1.md");
    await expect(page.getByTestId("status-chars")).toBeVisible();
    await expect(page.getByTestId("status-chars")).toContainText("文字");
  });

  test("空のコンテンツでは0語と表示される", async ({ page }) => {
    await openFile(page, "note1.md", {
      folderPath: DEFAULT_FOLDER,
      files: { [`${DEFAULT_FOLDER}/note1.md`]: "" },
      dirPaths: ["note1.md"],
    });
    await expect(page.getByTestId("status-words")).toContainText("0語");
  });

  test("正確な行数が表示される", async ({ page }) => {
    await openFile(page, "note1.md", {
      folderPath: DEFAULT_FOLDER,
      files: { [`${DEFAULT_FOLDER}/note1.md`]: "line1\nline2\nline3" },
      dirPaths: ["note1.md"],
    });
    await expect(page.getByTestId("status-lines")).toContainText("3行");
  });
});
