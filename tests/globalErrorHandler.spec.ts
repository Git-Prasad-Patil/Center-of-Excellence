import { test, expect } from "../utils/fixtures";

// Exercise: global error handler wired through utils/fixtures.ts.
// Using data: URLs keeps this deterministic and independent of any external site.

test.describe("Global error handler fixture", () => {
  test("clean page passes with no captured errors", async ({ page }) => {
    await page.goto("data:text/html,<h1>All good</h1>");
    await expect(page.getByRole("heading")).toHaveText("All good");
  });

  // Expected to fail: the page throws on load, the fixture captures it via
  // 'pageerror' and fails the test in its teardown. test.fail() tells
  // Playwright this failure is intentional, so the suite still reports green
  // while proving the handler actually fires on a real error.
  test.fail(
    "page with an uncaught JS error is caught by the fixture",
    async ({ page }) => {
      await page.goto(
        'data:text/html,<script>throw new Error("Boom - intentional error for exercise")</script>',
      );
    },
  );
});
