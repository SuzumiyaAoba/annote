import { test, expect } from "@playwright/test";

test.describe("テーマ切り替え", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("テーマ切り替えボタンが表示される", async ({ page }) => {
    await expect(page.getByTestId("theme-toggle-btn")).toBeVisible();
  });

  test("テーマを切り替えられる", async ({ page }) => {
    const html = page.locator("html");
    const initialTheme = await html.getAttribute("data-theme");

    await page.getByTestId("theme-toggle-btn").click();
    const newTheme = await html.getAttribute("data-theme");

    expect(newTheme).not.toBe(initialTheme);
    expect(["dark", "light"]).toContain(newTheme);
  });

  test("ダークモードからライトモードに切り替えられる", async ({ page }) => {
    const html = page.locator("html");
    const currentTheme = await html.getAttribute("data-theme");

    if (currentTheme !== "dark") {
      await page.getByTestId("theme-toggle-btn").click();
    }

    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByTestId("theme-toggle-btn").click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("ライトモードからダークモードに切り替えられる", async ({ page }) => {
    const html = page.locator("html");
    const currentTheme = await html.getAttribute("data-theme");

    if (currentTheme !== "light") {
      await page.getByTestId("theme-toggle-btn").click();
    }

    await expect(html).toHaveAttribute("data-theme", "light");
    await page.getByTestId("theme-toggle-btn").click();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("テーマがlocalStorageに保存される", async ({ page }) => {
    await page.getByTestId("theme-toggle-btn").click();
    const theme = await page.evaluate(() => {
      const stored = localStorage.getItem("annote-ui");
      if (!stored) return null;
      return JSON.parse(stored)?.state?.theme;
    });
    expect(["dark", "light"]).toContain(theme);
  });
});
