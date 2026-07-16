import { test, expect } from "../utils/fixtures";

test("Autowaiting and force timeout", async ({ page, homePage }) => {
  // Autowaiting is a feature in Playwright that automatically performs actionability checks before performing actions on elements.
  // This means that Playwright will wait for elements to be in a state where they can be interacted with (e.g., visible, enabled)
  // before attempting to perform actions on them.
  // This helps to ensure that the test runs smoothly and reduces the chances of flaky tests due to timing issues.

  // when we do not set timeout at test level, Playwright will use the default timeout of 30 seconds (configured in config.ts file) f
  // or all actions and assertions in that test.

  //   test.setTimeout(5000);
  // Set a timeout of 5 seconds for this test, this will apply to all the steps in this test

  // when we do not provide a specific timeout for an action,
  // Playwright will use the default timeout set for the test (in this case, 5 seconds) to wait for the element to become actionable before performing the action.
  // If the element does not become actionable within the specified timeout,
  // Playwright will throw an error indicating that the action could not be performed within the allotted time.

  // timeout can be overridden for specific steps if needed, for example:

  // Navigation happens inside the `homePage` fixture (utils/fixtures.ts),
  // which constructs HomePage and calls homePage.goto() before handing the
  // page object to the test — so by the time this test body runs, `page` is
  // already on the homepage.

  await expect(page).toHaveURL("https://demowebshop.tricentis.com/", {
    timeout: 3000,
  }); // Override the default timeout for this step to 3 seconds
  await expect(page.getByText("Welcome to our store")).toHaveText(
    "Welcome to our store",
    {
      timeout: 2000,
    },
  ); // Override the default timeout for this step to 2 seconds

  // force is a parameter that can be used in Playwright actions to bypass the default actionability checks and force the action to be performed on the element,
  // regardless of its state (e.g., even if it's not visible or enabled).
  // This can be useful in certain scenarios where you want to interact with an element that may not meet the usual criteria for being actionable,
  // such as when testing edge cases or when dealing with elements that are intentionally hidden or disabled.
  // Design decision: the click still routes through HeaderNavComponent
  // (no raw locator in the test), but `force: true` is passed in explicitly
  // at the call site rather than hard-coded inside clickRegister(). Baking
  // `force: true` permanently into the component would hide the exact thing
  // this test demonstrates (bypassing actionability checks); keeping it as
  // an explicit, visible option here preserves the lesson while still
  // encapsulating the locator itself inside the component.
  await homePage.headerNav.clickRegister({ force: true });
});
