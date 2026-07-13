# Step Definition Best Practices in TypeScript

## Parameterize instead of duplicating near-identical steps

The most common step-definition smell is a near-copy of the same step for every concrete value:

```ts
// Bad — one step definition per product
When("I add Blue Top to the cart", async function () { ... });
When("I add Men Tshirt to the cart", async function () { ... });
```

versus a single parameterized step using a Cucumber Expression:

```ts
// Good — one reusable step, product name is a parameter
When("I add {string} to the cart", async function (this: PlaywrightWorld, productName: string) {
  await searchAndAddProduct(this, productName);
});
```

(See [features/step-definitions/cart.steps.ts](../features/step-definitions/cart.steps.ts).) Cucumber Expressions (`{string}`, `{int}`, `{float}`, `{word}`) are preferred over hand-written regular expressions for this — they're more readable in a step definition file, and they auto-generate matching snippets when a step is undefined. Regex is still available for cases Cucumber Expressions can't express (alternation, optional groups more complex than the built-in `(s)` pluralization syntax), but it should be the exception, not the default.

## Reuse the same underlying function across `Given`/`When` phrasing

A step's *keyword* is about how a human reads the scenario, not about what code runs (see [04](./04-gherkin-syntax-reference.md) — matching is keyword-agnostic). This repo uses that deliberately: `search.steps.ts` registers both

```ts
When("I search the store for {string}", ...)
Given("I have searched the store for {string}", ...)
```

against the same `searchStore(world, term)` helper — one scenario uses search as the *action under test*, another uses it purely as *setup* for a cart scenario. Duplicating logic across two step bodies (rather than sharing a helper) is the mistake to avoid here; the fix is a small private function the registrations both call, not two independent implementations that can drift apart.

## Keep step definitions thin; put behaviour in page objects

A step definition should read as **one line of orchestration**, not a block of locator logic:

```ts
// Bad — locator details leak into the step definition
When("I add {string} to the cart", async function (this: PlaywrightWorld, name: string) {
  await this.page.locator(".product-image-wrapper", { hasText: name }).locator("button.cart").click();
});

// Good — step definition delegates to a page object
When("I add {string} to the cart", async function (this: PlaywrightWorld, name: string) {
  await new ProductDetailsPage(this.page).addToCart();
});
```

This repo's [features/support/pages.ts](../features/support/pages.ts) holds all locators; every step definition file ([search](../features/step-definitions/search.steps.ts), [cart](../features/step-definitions/cart.steps.ts), [account](../features/step-definitions/account.steps.ts), [checkout](../features/step-definitions/checkout.steps.ts)) only calls page-object methods. When Automation Exercise's markup changes, one file changes — not every step that happens to touch that page.

## Use the World for per-scenario state, never module-level variables

A step definition file is loaded once per run, so any variable declared at module scope is **shared across every scenario** in that run — the exact test-isolation bug documented in [DayFive's test isolation notes](../DayFive/07-test-isolation.md), just in Cucumber's context instead of Playwright's. This repo's `PlaywrightWorld` ([features/support/world.ts](../features/support/world.ts)) carries scenario-scoped values precisely so that state resets automatically every scenario, since Cucumber constructs a new `World` per scenario:
- `capturedUnitPrice` — the "quantity update" scenario reads a product's unit price on the detail page in a `When`, so a later `Then` can assert the cart's line total is that price times the chosen quantity.
- `createdAccountEmail` — set by the checkout scenario's registration step so the shared `After` hook ([06](./06-cucumber-playwright-typescript-integration.md)) knows to delete that throwaway account afterwards, without every step that might create an account needing to remember to clean up.

## Prefer declarative step text over technical step text

This is the automation-side mirror of the Gherkin-authoring guidance in [03](./03-effective-gherkin-vs-anti-patterns.md): if the `.feature` file stays declarative but the step *definition's registered text* still says `"I click the button with id add-to-cart-button-42"`, the coupling problem has just moved one file over. Step text should match the business language used in the scenario; the technical detail belongs entirely inside the function body (or one level further down, inside the page object).

## Fail with a useful message, not a bare assertion

Playwright's `expect` (used throughout this repo's step definitions instead of a separate assertion library) already produces good failure output for web-first assertions like `toBeVisible()`/`toContainText()` — including a retrying wait and a clear "locator resolved to 0 elements" message. The best-practice takeaway generalizes beyond Playwright: a step definition's assertion failure should tell you *which business expectation* failed, not just `expected true, got false`. Naming step-local variables clearly (`orderConfirmationHeading`, `loginErrorMessage`) does most of this work for free, since Playwright's error output includes the locator/expression being asserted on.

## Don't let step definitions become ambiguous

Cucumber refuses to run (raising an "ambiguous step" error) if a step's text matches more than one registered definition. This repo avoids that by keeping each step's wording specific to its exact behaviour (e.g. `"my cart should contain {int} line item(s)"` vs. `"the cart line for {string} should total {int} times its unit price"` — no overlapping wording), and by never registering the same step text twice across different files.

## A page-object method should wait for proof of the effect it claims to have

This one came from an actual bug hit while building this exercise ([09](./09-exercise-implementation-summary.md) has the full story), and is worth stating as its own rule: a method like `addToCart()` shouldn't just fire the click and return — it should wait for something that proves the click's side effect actually happened server-side. Automation Exercise's "Add to cart" button triggers an AJAX call before its confirmation modal appears, so:

```ts
// Bad — returns as soon as the click is dispatched, before the AJAX call resolves
async addToCart() {
  await this.page.locator("button.cart").click();
}

// Good — doesn't return until the modal proves the cart was actually updated
async addToCart() {
  await this.page.locator("button.cart").click();
  await this.page.locator("#cartModal").waitFor({ state: "visible" });
}
```

Without the second line, a step definition that adds an item and then immediately navigates away (e.g. straight to `/view_cart`) races the AJAX request — sometimes it wins, sometimes it doesn't, producing exactly the kind of intermittent, hard-to-reproduce failure this course's [DayFive material on flaky tests](../DayFive/01-brittle-vs-resilient-and-flaky-tests.md) warns about. The fix isn't a `waitForTimeout` (a fixed sleep guesses at the delay); it's waiting for a real, observable signal that the action completed.
