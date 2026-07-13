# Exercise Implementation Summary — BDD Gherkin & Cucumber/Playwright Automation

The other files in this folder are study notes on the referenced material. This one records what was actually *built* for the exercises, where it lives, how to run it, and the real bugs found (and fixed) while getting it to pass live.

## What was built

- **10 Gherkin scenarios** in [features/ecommerce.feature](../features/ecommerce.feature), targeting [automationexercise.com](https://automationexercise.com/) — a public practice store built specifically for this kind of automation exercise — covering search, cart, and checkout:
  - 3 search scenarios (happy path, negative — zero results, and a `Scenario Outline` for edge-case input: empty string, special characters, a very long string).
  - 5 cart scenarios (happy path add-to-cart with confirmation + cart contents, happy path multi-product add via a data table, edge case quantity selection with line-total verification, edge case remove-last-item empties the cart, negative — checkout blocked without logging in).
  - 2 account/checkout scenarios (happy path: register a new account via a data table, then check out and pay via a second data table, reaching an order confirmation; negative: logging in with incorrect credentials is rejected).
- **Cucumber + Playwright + TypeScript wiring** (see [06](./06-cucumber-playwright-typescript-integration.md) for the concepts behind each piece):
  - [cucumber.js](../cucumber.js) — CLI config, `ts-node/register` for TypeScript, `--require` globs for support/step files.
  - [features/support/world.ts](../features/support/world.ts) — custom `World` carrying `browser`/`context`/`page` plus small pieces of cross-step state (`capturedUnitPrice`, `createdAccountEmail`).
  - [features/support/hooks.ts](../features/support/hooks.ts) — one shared `Browser` for the run, a fresh `BrowserContext`/`Page` per scenario for test isolation, failure screenshots attached via `this.attach()`, and best-effort deletion of any test account a scenario created.
  - [features/support/pages.ts](../features/support/pages.ts) — page objects (`HomePage`, `ProductsPage`, `ProductDetailsPage`, `CartPage`, `SignupLoginPage`, `AccountInformationPage`, `CheckoutPage`, `PaymentPage`, `AccountPage`) holding all locators, so step definitions never touch a CSS selector directly.
  - [features/support/money.ts](../features/support/money.ts) — a small shared helper to parse a displayed price string (`"Rs. 500"`) into a number for the quantity/line-total math.
  - [features/step-definitions/{common,search,cart,account,checkout}.steps.ts](../features/step-definitions/) — the step definitions, per [07](./07-step-definition-best-practices.md): parameterized with Cucumber Expressions, reused across `Given`/`When` phrasing, and thin (all delegating to page objects).
- **Project wiring**: `@cucumber/cucumber` and `ts-node` as dev dependencies, `npm run test:bdd` script, `tsconfig.json` extended to include `features/**/*.ts`, and an `eslint.config.mjs` override so `cucumber.js` (a CommonJS config file) lints cleanly.

## How to run it

```
npm run test:bdd
```

Runs headless by default. To watch it run, set `HEADLESS=false` before invoking (`features/support/hooks.ts` reads that env var) — e.g. `HEADLESS=false npx cucumber-js` in Bash, or `$env:HEADLESS='false'; npx cucumber-js` in PowerShell.

To run a subset by tag (tags are `@search` / `@cart` / `@checkout` / `@account` and `@happy-path` / `@edge-case` / `@negative`):

```
npx cucumber-js --tags "@cart and @edge-case"
```

## Current status: fully green

`npx cucumber-js --dry-run` confirms all 12 executed scenarios (10 written `Scenario`/`Scenario Outline` blocks, the outline expanding to 3 example rows) resolve cleanly against the step definitions — 0 undefined steps, 0 ambiguous steps. A live run against `https://automationexercise.com` passes all 12/12:

```
2 hooks (2 passed)
12 scenarios (12 passed)
67 steps (67 passed)
```

This site was chosen (over an earlier attempt against demo.nopcommerce.com) specifically because it's reachable from this development environment without a bot-protection layer in the way — which meant every locator and every flow could actually be driven and verified live, not just written from memory of "how this kind of site usually works."

## Three real bugs found and fixed while getting here

Writing automation against a real, unowned site and actually running it (rather than stopping at "the code compiles and the dry-run passes") surfaced three genuine bugs — each a small case study in something covered elsewhere in these notes.

**1. An unreliable interaction that "succeeded" without doing anything.** The product listing page shows an "Add to cart" button only as a hover overlay on each product tile. Clicking it under Playwright didn't throw an error, but the site's cart-confirmation modal frequently never appeared — meaning the click landed, but the click handler that actually adds the item to the cart didn't reliably fire in a headless browser. The fix was to stop relying on the hover overlay entirely and drive "add to cart" through the product detail page instead, which has a plain, always-visible button with no hover/JS-timing dependency. This is the [DayFive flaky-test lesson](../DayFive/01-brittle-vs-resilient-and-flaky-tests.md) from a different angle: sometimes the fix for an unreliable interaction isn't a longer wait, it's a more reliable path through the UI.

**2. A genuine race condition.** Even after switching to the detail page, some scenarios still intermittently failed to find the item they'd "just added" to the cart. The detail page's "Add to cart" button fires an AJAX call and only *then* shows a confirmation modal — but the page object's `addToCart()` method returned as soon as the click was dispatched, before that request had necessarily completed. A step definition that then immediately navigated to `/view_cart` could beat the AJAX call there. The fix (documented in [07](./07-step-definition-best-practices.md)) was to make `addToCart()` wait for the confirmation modal to become visible before returning — a real, observable signal that the add had actually completed, rather than a fixed `waitForTimeout` guess.

**3. A currency-parsing bug in test code, not the site.** The quantity scenario ("adding 3 of a product should make the line total 3× its unit price") failed with numbers that were off by roughly 1000×. The cause: the site displays prices as `"Rs. 500"`, and the original `parsePrice` helper stripped every character except digits and periods — which kept the period in the `"Rs."` abbreviation itself, turning `"Rs. 500"` into `".500"` and parsing it as `0.5` instead of `500`. The fix, in [features/support/money.ts](../features/support/money.ts), anchors the regex on the trailing digit run at the end of the string instead of stripping characters indiscriminately — a reminder that test *helper* code needs the same scrutiny as the code under test, since a silently-wrong assertion helper produces a confidently-wrong failure message that looks like a product bug.

## Principles reinforced by doing this exercise

- Writing the Gherkin *before* wiring up any step definitions (which is what happened here) is a small taste of why the Three Amigos conversation ([02](./02-three-amigos.md)) matters — several edge cases (empty search, incorrect-login negative case) only got added because of deliberately asking "what could go wrong" while drafting.
- Keeping scenarios declarative (see [03](./03-effective-gherkin-vs-anti-patterns.md)) kept the step definitions reusable even after the underlying implementation changed twice (listing-page hover → detail-page button, and the account-registration sequencing fix) — not one line of [features/ecommerce.feature](../features/ecommerce.feature) needed to change for either fix, because the scenarios described *what*, not *how*.
- A data table (see [05](./05-cucumber-datatables.md)) was clearly the right call for both the multi-field account registration and the card payment details — a dozen separate `And I enter "X" into the Y field` steps would have been exactly the imperative anti-pattern this exercise was meant to avoid.
- "It ran once without an error" and "it's actually correct" are different claims — the parsing bug above produced a *test failure* (loudly wrong), which is the good case; a less careful assertion could just as easily have produced a silently wrong pass instead.
