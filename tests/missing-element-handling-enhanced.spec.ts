import { test, expect } from "@playwright/test";

test("missing element handling - enhanced with error handling", async ({
  page,
}) => {
  await page.goto("https://example.com");

  try {
    // Try to find non-existent element with timeout
    await page.waitForSelector("#nonExistentElement", { timeout: 2000 });
  } catch {
    // Handle gracefully when element is not found
    console.log("Element not found - handled gracefully");
  }

  // Verify element doesn't exist using $ which returns null
  const element = await page.$("#nonExistentElement");
  expect(element).toBeNull();
});
