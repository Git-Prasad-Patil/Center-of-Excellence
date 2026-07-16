import { test, expect } from "../utils/fixtures";

// eslint-disable-next-line no-empty-pattern
test("Hard Assertions - example", async ({}) => {
  // Hard Assertion: failing assertion will stop test execution immediately.
  const value = 5;
  expect(value).toBe(5); // passes
  expect(value).toBe(10); // will fail and stop this test
  expect(value).toBe(5);
});

test("Soft Assertions - example", async ({ homePage }) => {
  // Soft Assertion: use `expect.soft` to allow the test to continue after failures.
  // Navigation and title-reading are routed through the `homePage` fixture/
  // page object; the assertion values themselves are left exactly as-is —
  // this test is intentionally designed to still fail two of its three
  // assertions, demonstrating soft-assertion behavior, and that outcome
  // must not change.
  const title = await homePage.getTitle();
  expect.soft(title).toBe("Demo Web Shop"); // likely passes
  expect.soft(title).toBe("Incorrect Title"); // will fail but test continues
  expect.soft(title).toBe("Prasad Patil");
  // Note: to inspect soft assertion results programmatically, use Playwright's
  // soft assertion reporting APIs if available in your Playwright version.
});
