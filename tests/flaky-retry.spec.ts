import { test, expect } from "@playwright/test";

// Exercise: configure retry logic and prove it against an intentionally
// unreliable scenario. Retries are scoped to this describe block (rather
// than raised globally) so the rest of the suite keeps its fast, retry-free
// feedback loop - only this known-flaky scenario pays the retry cost.
test.describe("Retry logic exercise", () => {
  test.describe.configure({ retries: 2 });

  test("recovers after a simulated flake", async ({ page }, testInfo) => {
    await page.goto("https://playwright.dev");

    // Fails on the first attempt only, simulating something like a
    // slow-loading widget or a backend that's occasionally slow to respond.
    if (testInfo.retry === 0) {
      expect(
        testInfo.retry,
        "Simulated flake - forcing Playwright to retry this test",
      ).toBeGreaterThan(0);
    }

    await expect(page).toHaveTitle(/Playwright/);
  });

  // Expected to fail even after every retry - proves retries are a safety
  // net for genuine flakiness, not a way to mask a truly broken assertion.
  test.fail(
    "exhausts all retries and still fails when genuinely broken",
    async () => {
      expect(1, "Intentionally broken assertion for the exercise").toBe(2);
    },
  );
});
