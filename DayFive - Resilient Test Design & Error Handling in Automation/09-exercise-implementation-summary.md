# Exercise Implementation Summary — Resilient Test Design & Error Handling

The other files in this folder are the study notes. This one records what was actually *built* to satisfy the exercises, where it lives, and what running it proved.

## 1. Root causes of flakiness found in this repo's own sample suite

Applying the Spotify root-cause list ([01-brittle-vs-resilient-and-flaky-tests.md](./01-brittle-vs-resilient-and-flaky-tests.md)) to the existing specs in [tests/](../tests):

- [tests/drag-and-drop.spec.ts](../tests/drag-and-drop.spec.ts) ends with `page.waitForTimeout(2000)` — a fixed sleep instead of waiting for a real condition. Inconsistent load/animation timing on a slow run could make this pass or fail unpredictably (Spotify's #1 cause: inconsistent assertion timing).
- [tests/auto-waiting.spec.ts](../tests/auto-waiting.spec.ts) clicks with `{ force: true }`, bypassing Playwright's actionability checks. This hides the case where the "Register" link is genuinely not interactable (covered up, disabled) — a resilient test should wait for the real state, not force past it.
- Before this session, no spec verified console/page errors — a page could throw a JS exception and every spec would still report green. That's a silent-failure risk, not a flaky one, but it's the gap [02-typescript-error-handling-patterns.md](./02-typescript-error-handling-patterns.md) calls out directly.
- No spec used `testInfo.retry` or scoped retries, so there was nothing in the suite proving the configured `retries` value ([playwright.config.ts](../playwright.config.ts)) actually recovers a flaky test rather than just being an unused config field.
- No spec demonstrated genuine test isolation (or its absence) — see below.

## 2. Global error handler — implemented

[utils/fixtures.ts](../utils/fixtures.ts) overrides the built-in `page` fixture to listen for `console` (filtered to `error`), `pageerror`, and `crash` events, and fails the test in teardown if any were captured. Any spec that imports `test`/`expect` from `../utils/fixtures` instead of `@playwright/test` gets this automatically — no per-test boilerplate.

Proven in [tests/global-error-handler.spec.ts](../tests/global-error-handler.spec.ts):
- A clean `data:` page passes with zero captured errors.
- A page that throws on load is caught via `pageerror` and fails the test (asserted with `test.fail()` so the suite itself stays green while proving the handler fires).

## 3. Retry logic — implemented

[tests/flaky-retry.spec.ts](../tests/flaky-retry.spec.ts) scopes `retries: 2` to just this `describe` block (global retries stay `process.env.CI ? 2 : 0`, so the rest of the suite keeps fast local feedback).

Running it confirmed both halves of the exercise:
- The intentionally-flaky test fails on attempt 1 (`testInfo.retry === 0`) and passes on retry — Playwright reported it as **1 flaky**, not failed.
- A genuinely broken assertion (`expect(1).toBe(2)`) still fails on every retry, proving retries mask real flakiness but not real bugs.

## 4. Test isolation — refactored

[tests/test-isolation.spec.ts](../tests/test-isolation.spec.ts) documents the anti-pattern in a comment block (shared module-level `cartBadgeCount` variable, one test writing it, another reading it — breaks if run alone/out of order/in parallel), then implements the fix: a `loginAndAddFirstItemToCart` helper called from `beforeEach`, so both tests build their own state independently. Verified both tests pass individually and together.

## 5. Screenshots and video on failure

Already configured in [playwright.config.ts](../playwright.config.ts) (`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'`) — confirmed working as a side effect of the retry exercise run: the failing attempt of `flaky-retry.spec.ts` produced a screenshot, a video, and an error-context file under `test-results/`, attached automatically.

## Principles learned

- Resilience isn't one setting — it's the combination of good locators, real waits instead of sleeps, isolated state per test, and visibility into silent failures (console/page errors).
- Retries are a safety net for genuine flakiness, not a substitute for fixing a broken test or a brittle locator — the exercise's "still fails after retries" case is the proof.
- Scoping retries to the specific flaky group (rather than raising the global default) keeps the rest of the suite's feedback loop fast.
- A shared fixture is the idiomatic way to get "global" behavior in Playwright, since there's no literal global-hook config field for arbitrary per-test logic.
- "Flaky" and "failed" are different signals in Playwright's report — flaky means investigate, failed means fix now. Both matter; neither should be silently retried away without follow-up.
