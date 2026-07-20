# Practice — Simplifying the Most Complex Test (`tests/login.spec.ts`)

## Picking the target

`tests/login.spec.ts` was the largest and most repetitive file in the suite: **218 lines, 16 tests**, more than 3x the next-largest spec (`test-isolation.spec.ts` at 57 lines). Every single test repeated the same four-line shape — `goto`, fill username, fill password, click submit — followed by one of two assertion shapes (success or error). That repetition, not any one gnarly test, was the actual complexity: 16 near-identical blocks make the file hard to scan and easy to introduce inconsistency into (e.g. one test asserting URL before text, another after).

## What was applied, and why

**Day 2 — Clean Code Checklist**
- The checklist's core theme is *"catch only what you can name a reason for, never let a test pass quietly."* The one real violation in this file was the double-click race test:
  ```ts
  await Promise.all([
    page.locator('#submit').click(),
    page.locator('#submit').click().catch(() => {}),
  ]);
  ```
  An empty `catch {}` is exactly the checklist's "no empty catch blocks" red flag — even though the intent (tolerate the second click failing) was sound and already commented. Swapped it for `Promise.allSettled(...)`, which expresses "I don't care if one of these rejects" as the *shape* of the code instead of hiding it behind a silently-swallowing catch. Same behavior, no empty catch left to explain.
- DRY: extracted three helpers — `attemptLogin(page, username, password)`, `expectLoginSuccess(page)`, `expectLoginError(page, message)` — collapsing ~6 repeated lines per test down to 1-3.
- Magic strings replaced with named constants (`VALID_USERNAME`, `VALID_PASSWORD`, `WELCOME_MESSAGE`, `SUCCESS_URL_PATTERN`) so a credential or copy change is a one-line edit, not a 10-file find-and-replace.

**Day 3 — ZOMBIES**
The 16 tests were flat and unordered — a reader had to read every title to find where "the weird cases" lived. Regrouped into six `test.describe` blocks named after the ZOMBIES categories, in ZOMBIES order:
- **Zero** — blank/blank submission
- **One** — the three single-credential happy/error paths
- **Many** — the retry-after-failure sequence (multiple submissions)
- **Boundary** — case sensitivity, whitespace padding, extreme length
- **Exceptions** — SQL-injection-like input, concurrent-click race
- **Interface** — alternate entry paths (Enter key, direct URL nav, back button)

This didn't change what's tested — it changed how fast a reader (or future me) can answer "do we cover boundary cases here?" from a glance at the `describe` titles instead of reading 16 test bodies.

**Day 5 — Resilient Test Design**
- No arbitrary waits were present to begin with (Playwright's auto-waiting locators were already used correctly) — nothing to fix there.
- The one resilience-relevant change is the same `allSettled` swap above: it's the "narrow, nameable, non-silent" version of tolerating a flaky/racy interaction, which is the Day 5 theme applied at the assertion-tolerance level rather than the retry-loop level.

## Before → after

| | Before | After |
|---|---|---|
| Lines | 218 | 169 (-23%) |
| Repeated goto/fill/fill/click blocks | 16, inline | 1 helper (`attemptLogin`), called 14x |
| Repeated success/error assertion blocks | 16, inline | 2 helpers (`expectLoginSuccess`, `expectLoginError`) |
| Test organization | Flat list, declaration order | 6 `describe` blocks, ZOMBIES order |
| Magic strings | `'student'`, `'Password123'`, welcome text repeated 3x each | Named constants, defined once |
| Empty/silent catch | 1 (`.catch(() => {})`) | 0 (`Promise.allSettled`) |

## Verification

- `npx eslint tests/login.spec.ts` — clean, no warnings.
- `npx playwright test tests/login.spec.ts` — **16/16 passed** against the live practice site, same coverage as before the refactor (no test was removed, renamed test titles preserved the original behavior description).
