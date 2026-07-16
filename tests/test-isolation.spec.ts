import { test, expect, Page } from "@playwright/test";

// Exercise: refactor a dependent test suite into isolated, independent tests.
//
// ANTI-PATTERN (do not do this) - tests share state through a module-level
// variable, so "user checks out" only works if "user adds item to cart" ran
// first, in that order, in the same worker. Run it alone or in parallel and
// it breaks:
//
//   let cartBadgeCount: string;
//
//   test("user adds item to cart", async ({ page }) => {
//     await page.goto("https://www.saucedemo.com/");
//     await page.getByPlaceholder("Username").fill("standard_user");
//     await page.getByPlaceholder("Password").fill("secret_sauce");
//     await page.getByRole("button", { name: "Login" }).click();
//     await page.locator(".inventory_item button", { hasText: "Add to cart" }).first().click();
//     cartBadgeCount = await page.locator(".shopping_cart_badge").innerText(); // saved for later test
//   });
//
//   test("user checks out", async ({ page }) => {
//     // fails if run alone, out of order, or in parallel - cartBadgeCount is undefined
//     expect(cartBadgeCount).toBe("1");
//     await page.locator(".shopping_cart_link").click();
//     ...
//   });

async function loginAndAddFirstItemToCart(page: Page): Promise<void> {
  await page.goto("https://www.saucedemo.com/");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
  await page.locator(".inventory_item").first().getByRole("button", { name: "Add to cart" }).click();
}

// AFTER (isolated) - each test builds its own state via beforeEach, so any
// test can run alone, in any order, or in parallel, and a failure in one
// never cascades into a confusing failure in another.
test.describe("Test isolation - refactored independent tests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndAddFirstItemToCart(page);
  });

  test("cart badge reflects the item just added", async ({ page }) => {
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  });

  test("user can proceed to checkout independently", async ({ page }) => {
    await page.locator(".shopping_cart_link").click();
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByPlaceholder("First Name").fill("Prasad");
    await page.getByPlaceholder("Last Name").fill("Patil");
    await page.getByPlaceholder("Zip/Postal Code").fill("411001");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Checkout: Overview")).toBeVisible();
  });
});
