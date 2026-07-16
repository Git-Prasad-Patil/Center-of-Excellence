import { test as base, expect } from "@playwright/test";
import { HomePage } from "../pages/home.page";
import { RegistrationPage } from "../pages/registration.page";

// Playwright has no literal "global error handler" config field, so the
// idiomatic way to get one is a shared fixture that wraps the built-in
// `page` fixture. Every spec that imports `test` from here gets automatic
// console/page-error/crash capturing for free, with no per-test boilerplate.

type CapturedError = {
  type: "console" | "pageerror" | "crash";
  message: string;
};

const testWithErrorHandling = base.extend({
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

type PageObjectFixtures = {
  homePage: HomePage;
  registrationPage: RegistrationPage;
};

// Fixtures + POM pairing (see
// "DayNine - Page Object Model Depth & Framework Architecture/05-playwright-fixtures.md"):
// its own recommended pattern is a fixture that constructs the page object,
// runs its setup (here, navigating home), and hands it to the test — instead
// of a `beforeEach` repeated in every spec file. This is layered ON TOP of
// (not instead of) the error-handling `page` fixture above, via
// `testWithErrorHandling.extend`, so every spec that imports `test` from
// this single module gets BOTH: automatic console/pageerror/crash failure
// detection AND a ready-to-use, already-navigated `homePage`.
export const test = testWithErrorHandling.extend<PageObjectFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await use(homePage);
  },

  // Unlike homePage, this fixture does NOT navigate before handing the page
  // object to the test. homePage's goto() is cheap and every test that asks
  // for it wants to land there first; registrationPage tests are less
  // uniform — a test may want to set up other state (or start from a
  // different page and navigate to /register mid-flow) before registration
  // should happen. So construction and navigation stay separate here: the
  // fixture only constructs, and the test calls `.goto()` explicitly when
  // it's ready.
  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  },
});

export { expect };
