import { test as base, expect } from "@playwright/test";

// Playwright has no literal "global error handler" config field, so the
// idiomatic way to get one is a shared fixture that wraps the built-in
// `page` fixture. Every spec that imports `test` from here gets automatic
// console/page-error/crash capturing for free, with no per-test boilerplate.

type CapturedError = {
  type: "console" | "pageerror" | "crash";
  message: string;
};

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: CapturedError[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push({ type: "console", message: msg.text() });
      }
    });

    page.on("pageerror", (error) => {
      errors.push({ type: "pageerror", message: error.message });
    });

    page.on("crash", () => {
      errors.push({ type: "crash", message: "Page crashed" });
    });

    await use(page);

    if (errors.length > 0) {
      console.warn("Captured page errors:", errors);
    }
    expect(errors, "Page should not log console/page/crash errors during the test").toEqual([]);
  },
});

export { expect };
