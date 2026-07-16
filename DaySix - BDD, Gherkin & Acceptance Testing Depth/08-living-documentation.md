# Living Documentation — Gherkin as Executable Specification

## The core idea

A `.feature` file is meant to serve two audiences at once: a human reading it as a specification of intended behaviour, and a test runner executing it as a regression check. "Living documentation" is the name for the property that keeps those two readings from drifting apart — the documentation is "alive" because it **cannot go stale without a test failing**. Compare that to a Confluence page or a requirements doc, which can silently describe behaviour the system stopped having six months ago, and nobody finds out until a customer does.

## Why this only works if the scenarios stay declarative

Living documentation breaks down the moment scenarios are written imperatively (see [03](./03-effective-gherkin-vs-anti-patterns.md)) — a scenario full of "click this button, fill this field" isn't documentation anyone would choose to read to understand *what the system does*; it's a script that happens to also run. The declarative style ("a guest completes checkout with valid billing details") is what makes the `.feature` file readable as a specification in its own right, independent of the automation underneath it.

## Where this repo's exercise demonstrates it

[features/ecommerce.feature](../features/ecommerce.feature) is written so that reading it top to bottom — with zero knowledge of Playwright, TypeScript, or Automation Exercise's actual markup — tells you what the store is supposed to do:

- Search returns matching products, handles no-results and odd input gracefully.
- The cart accumulates items correctly, recalculates on quantity change, and empties on removal.
- Checkout requires an account, rejects incorrect login credentials, and a newly registered shopper can pay and reach an order confirmation.

That's a legitimate (if partial) specification of the store's expected behaviour, and it's also literally the same file `cucumber-js` executes. If a future change added a guest-checkout option and stopped forcing signup, the "Proceeding to checkout without logging in" scenario would start failing — the documentation would visibly and immediately announce that it's now wrong, rather than quietly becoming a lie the way a static requirements doc would.

## Living documentation is a property of the whole pipeline, not just the `.feature` file

It requires three things to actually hold, all present in this repo's setup:

1. **The scenarios are genuinely run**, not just aspirational — `npm run test:bdd` executes every `.feature` file via [cucumber.js](../cucumber.js). A `.feature` file nobody runs is back to being a regular document that can rot.
2. **A failure is visible and attributable** — the HTML report (`cucumber-report.html`) and the failure screenshot attached via `this.attach()` in [features/support/hooks.ts](../features/support/hooks.ts) mean a failing scenario doesn't just print a red line in a terminal someone can ignore; it's a report someone can open and act on.
3. **The scenario text and the step definition stay in sync by construction**, because Cucumber literally fails the run (`undefined step`) if a `.feature` file's wording doesn't match a registered step. This is a much stronger guarantee than a plain prose doc has — you cannot "forget to update the docs" without the test suite immediately telling you.

## The trade-off worth being honest about

Living documentation is only as trustworthy as the *coverage* of the scenarios — a `.feature` file that only covers the happy path documents (and protects) only the happy path, and reads as if the edge/negative behaviour either doesn't exist or doesn't matter. That's the direct justification for this exercise requiring happy-path, edge-case, *and* negative scenarios ([features/ecommerce.feature](../features/ecommerce.feature) includes all three) — a living-documentation suite with only happy paths is living documentation of a system that doesn't handle failure, which is rarely true and rarely useful to whoever reads it next.
