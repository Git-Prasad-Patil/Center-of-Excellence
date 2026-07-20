# Study — Pyramid or Trophy? Deciding the Shape for This Project

Building on [04-test-pyramid-notes.md](./04-test-pyramid-notes.md) and [05-testing-trophy-notes.md](./05-testing-trophy-notes.md): which shape actually describes (or should describe) *this* repository's test suite?

## What this repo's suite actually looks like today

A quick inventory:

| Layer | What exists |
|---|---|
| Static | TypeScript (`tsconfig.json`) + ESLint (`eslint.config.mjs`) — present, just never framed as a "layer" before this exercise |
| Unit | **None.** No Jest/Vitest/Mocha runner is configured (`package.json` has no unit-test script) |
| Integration | **None**, in the classic pyramid sense (no database, no service of our own to integration-test) |
| E2E / UI | **All 16 files in `tests/*.spec.ts`**, plus the Cucumber/Gherkin BDD layer in `features/` — every one of them drives a real browser via Playwright against a real, live, external site (practicetestautomation.com, a demo e-commerce site, etc.) |

In pyramid or trophy terms: **100% of the automated coverage sits at the very top of the pyramid / the very tip of the trophy.** There is currently no base at all.

## Why neither shape applies cleanly, as-is

Both the pyramid and the trophy assume the team **owns the full stack** — application code with business logic, a backend/service layer, and a UI on top — and is deciding how to *distribute* test effort across layers it controls. That assumption doesn't hold here:

- The "system under test" in almost every spec is **someone else's website**. There's no business logic of ours to unit test inside `isEligible()`-style functions, because the login validation, cart totals, and search behavior all live in code we don't have access to — only the browser-visible result of it.
- The pyramid's advice ("push tests down, keep e2e to a minority") assumes you *can* push a case down to a unit test if a lower layer can verify the same thing more cheaply. Here, most cases genuinely **can't** be pushed down — "does this login page reject a capitalized username" is only checkable by driving the actual page.
- So a large, near-total E2E layer isn't a smell to fix here the way it would be on a real product team — it's the correct shape for **"exercise a live external site says it works,"** which is the actual purpose of most of this repo.

## Where a real base *does* exist — and isn't being tested yet

Not everything in this repo is "someone else's site," though. This repo also owns real, testable logic of its own:

- `features/support/money.ts` — money/currency formatting and arithmetic
- `utils/test-data-factory.ts` — test data generation logic
- `pages/base.page.ts` — the `captureErrorContext` helper and other base-class methods
- Page object / component object methods that do more than a single Playwright call (any conditional logic, data transformation, or assembly inside `pages/*.ts`, `pages/components/*.ts`)

None of this currently has a unit test, because there's no unit-test runner in the project at all. This is the actual, concrete gap — not "not enough unit tests relative to e2e tests" in the abstract, but **zero tests on the pure logic this repo genuinely owns.**

## Decision

**Adopt a hybrid, split by what's actually being tested — Trophy-flavored for the code this repo owns, permanently E2E-heavy for the code it doesn't:**

1. **For the framework/tooling code we own** (`money.ts`, `test-data-factory.ts`, `base.page.ts`, component objects) — follow Trophy-style thinking: add a real unit-test layer (a runner like Vitest/Jest would need to be introduced — currently missing entirely) for this pure logic, using ZOMBIES to drive case design. This is exactly the layer that's cheap, fast, and — not coincidentally — the layer [Stryker mutation testing](./07-mutation-testing-and-stryker-notes.md) is actually suited to, unlike full browser E2E specs. See [08-stryker-mutation-run-results.md](./08-stryker-mutation-run-results.md) for the practical run against this layer.
2. **Static layer** — already present (TypeScript + ESLint); no change needed, just worth naming it as a real layer going forward rather than background tooling.
3. **No classic "integration" layer** (DB/service integration) — not applicable; nothing to add here unless this repo ever grows a backend of its own.
4. **Keep the E2E layer exactly as large as it is** — this is not the "ice-cream cone" anti-pattern the pyramid warns about, because there is no lower-cost way to verify "does this real login page behave correctly" other than driving the real page. Shrinking this layer would mean testing less, not testing smarter.

**Reasoning in one line:** the pyramid/trophy debate is about how *a team that owns the whole stack* should distribute effort across layers it controls; this repo mostly tests external systems it doesn't own, so the debate mostly doesn't apply to the bulk of the suite — but it applies fully, and currently reveals a real gap, in the thin slice of code (`support`/`utils`/`pages` logic) that this repo *does* own outright.

**Evolution trigger:** if this repo ever adds its own backend/API (e.g. a mock server for the e-commerce practice site, or a real service this project owns), that's the point to introduce a genuine integration-test layer between the new unit tests and the existing E2E suite — not before.
