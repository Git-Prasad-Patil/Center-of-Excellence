# Self Code Review — Clean Code Checklist (Days 3-9)

Scope: every file in `tests/*.spec.ts` (16 files), `features/step-definitions/*.ts` (5 files), `features/support/*.ts` (4 files), `pages/*.ts` + `pages/components/*.ts` (5 files), and `utils/*.ts` (3 files) — all the test/automation code produced from Day 3 through Day 9, reviewed against my own [Clean Code Checklist for Test Automation](../DayTwo%20-%20Clean%20Code%20%26%20Craftsmanship%20for%20QA/Clean%20Code%20Checklist%20for%20Test%20Automation.md) from Day 2.

**Headline finding first, since it's the honest one:** there is almost no `try/catch` in this codebase. A `grep` across all of it turns up exactly **5** catch blocks total, in a codebase of 16 spec files + 14 support/page/step files. That's the checklist's own advice ("write less try/catch, not more") working as intended — most of these are plain Playwright specs that lean on auto-waiting and Playwright's own failure reporting, so there's simply less surface area for the try/catch checklist to bite on than I expected when I set out to write this review. The interesting findings are concentrated in a handful of specific lines, plus a few clean-code smells the checklist doesn't explicitly name.

---

## Before adding a try/catch

> *"Do I have a specific reason to catch this, or am I just trying to make an error go away?"* / *"Could I get a clearer error for free by just letting Playwright's own timeout/assertion error surface instead?"*

**Satisfies well:**
- `tests/frames-demo.spec.ts:13-16` — instead of a try/catch around `page.frame(...)`, the code checks the return value directly (`if (!frame1) { logger.error(...); throw new Error("Frame 1 not found"); }`). No catch needed because `page.frame()` doesn't throw, it returns `null` — this correctly matches the "let Playwright's own behavior surface" instinct without inventing an unnecessary catch.
- `features/step-definitions/*.ts` (all 5 files) and `features/support/world.ts`, `features/support/money.ts`, `utils/test-data-factory.ts` — zero try/catch anywhere. Every step definition trusts Playwright's own timeout/assertion errors to surface with a useful message. This is the checklist's default ("write less try/catch") applied consistently across the entire step-definition layer.
- `utils/fixtures.ts:15-40` — the global error-handling fixture doesn't try/catch anything; it listens for `console`/`pageerror`/`crash` events and turns them into a failing `expect(errors).toEqual([])` at fixture teardown. This gets "clearer error for free" almost literally — it's Playwright's own event system doing the catching, and the fixture just refuses to let those events pass silently.

**Violates / partial:**
- `tests/missing-element-handling-enhanced.spec.ts:8-14` — this is the clearest case of "catching without a specific reason." The try/catch wraps `page.waitForSelector("#nonExistentElement", { timeout: 2000 })` purely to swallow the expected timeout, but the very next lines (`page.$("#nonExistentElement")` + `expect(element).toBeNull()`) already prove the element is missing *without throwing at all*. The try/catch adds a 2-second wasted wait and zero verification value — it's not proving anything the later `expect` doesn't already prove. This is exactly the "am I just trying to make an error go away" case the checklist warns about.

---

## If I do catch, make sure the catch is narrow / I rethrow / context is added / error is narrowed / cleanup uses try/finally

**Satisfies well:**
- `pages/registration.page.ts:63-84` — this is the best example in the whole codebase of the checklist's ideal pattern. The `try` wraps exactly one action (the registration form submit + wait for confirmation), the `catch (error)` calls `this.captureErrorContext(error, "registration-submit")` to attach a screenshot + log line, and then **rethrows the exact same error unchanged** (`throw error;`) rather than swallowing or replacing it. Narrow scope, context added, no swallowing — textbook.
- `pages/base.page.ts:52-66` (`captureErrorContext`) — the inner `try { await this.page.screenshot(...) } catch (screenshotError) { logger.error(...) }` is a second, smaller catch nested inside the diagnostics helper itself. It's narrow (wraps only the screenshot call), and the class-level comment (lines 11-16) explicitly documents *why* it doesn't rethrow: a failure to capture a screenshot is a secondary problem and shouldn't mask the real error that triggered `captureErrorContext` in the first place. That's a documented, deliberate decision not to rethrow — which the checklist explicitly allows for.
- `features/support/hooks.ts:29-34` — `await new AccountPage(this.page).deleteAccount().catch(() => undefined);` swallows the cleanup failure, but it comes with an inline comment (lines 30-32) spelling out the reasoning: best-effort cleanup on a shared demo site, and a cleanup failure shouldn't mask the actual scenario result. This is precisely the "documented, deliberate reason not to rethrow" the checklist asks for.

**Violates / partial:**
- **Error narrowing is never actually exercised.** A `grep` for `instanceof Error` across the whole codebase returns nothing. This isn't a violation exactly — nobody does `error.message` on an untyped catch variable and risks a compile error — but it's also not a demonstration of the practice. Both real error-context catches (`base.page.ts`, `registration.page.ts`) type the caught value as `unknown` and sidestep the issue entirely by interpolating `${error}`/`${screenshotError}` into a template literal (relying on `Error.prototype.toString()`) instead of narrowing and reading `.message`. It works, but if I ever need a *specific* field off the error (a Playwright `TimeoutError`'s `.name`, for instance), there's no existing example in this codebase to copy from.
- `tests/login.spec.ts:211-214` — `Promise.all([page.locator('#submit').click(), page.locator('#submit').click().catch(() => {})])`. This is a genuinely empty catch block. There's a comment above it explaining the reasoning (tolerating the second click failing if the first click's navigation detaches the button), so it's not *unexplained*, but it still violates the letter of "no empty catch {} blocks anywhere" and does nothing with the caught error — no log, no assertion that the failure was the expected "element detached" kind versus something else entirely.
- No `try/finally` appears anywhere in the codebase. There's no case here that actually needed one (no manual resource acquisition outside what Playwright/Cucumber hooks already manage — browser/context/page lifecycle in `features/support/hooks.ts` is handled via `Before`/`After` hooks, not manual try/finally), so this isn't a violation so much as an untested checklist item — I have no code that proves I'd reach for `try/finally` correctly when the situation calls for it.

---

## Retry logic specifically

**Satisfies well:**
- `playwright.config.ts:11` — `retries: process.env.CI ? 2 : 0` — capped, never infinite, and scoped to CI only (no silent retry-masking during local development where I want the real, first-attempt result).
- `tests/flaky-retry.spec.ts:7-8` — `test.describe.configure({ retries: 2 })` deliberately scopes the retry override to just this one describe block, with a comment explaining *why* (so the rest of the suite keeps its fast, retry-free feedback loop). That's "retries used for genuinely flaky infra, not to paper over a bug" applied thoughtfully — the retry is opt-in and localized, not a blanket global default bumped up to hide a bad locator somewhere else.
- `tests/flaky-retry.spec.ts:27-32` — the `test.fail(...)` case (an assertion that's deliberately wrong) proves the retry mechanism doesn't rescue a genuinely broken test — it's expected to exhaust all retries and still fail. This is exactly the checklist's "retries are for flakiness, not for masking a real bug" point, demonstrated rather than just asserted in a comment.

**Violates / partial:**
- **No retry-attempt logging exists anywhere.** The checklist explicitly asks for "logged each retry attempt so patterns of flakiness are visible later." `tests/flaky-retry.spec.ts` uses `testInfo.retry` only inside an assertion message (line 15-19), not as a logged signal. There's no `logger.warn`/`logger.info` call anywhere that records "this test is on retry attempt N." In practice Playwright's HTML/trace reporting does capture retries out of band, so this isn't silently hidden — but it's also not something *this codebase* does on purpose, so if the reporter config ever changed, retry patterns would go dark with nothing in the code itself to catch that.

---

## Before merging — whole-file sanity check

> *No empty catch {} / no catch-and-console.log-and-continue / no single try/catch around the whole test / assertions never wrapped in try/catch / diagnostics added on the way out via rethrow, not instead of it.*

**Satisfies well:**
- **No file wraps an entire test body in a single try/catch.** Across all 16 spec files and 5 step-definition files, every try/catch (there are only the 5 already discussed) wraps a single action, never a whole test. If any of these tests fails, the failing line is unambiguous from the stack trace alone — which is exactly the point of this rule.
- **Assertions are never wrapped in try/catch anywhere.** Every `expect(...)`/`expect.soft(...)` call across all 16 spec files and all step-definition `Then(...)` steps sits outside any try block. `tests/hard-soft-assertions.spec.ts` in particular is built specifically to demonstrate hard vs. soft assertion *failure* behavior, and even there the assertions aren't caught — they're allowed to fail and (in the soft case) let the test continue on its own terms, exactly as Playwright intends.
- `pages/registration.page.ts` is the one place diagnostics are added on the way out via rethrow (`captureErrorContext` then `throw error`) rather than as a replacement for rethrowing — the checklist's distinction between "diagnostics on the way out" and "diagnostics instead of rethrowing" is respected there.

**Violates / partial:**
- `tests/missing-element-handling-enhanced.spec.ts:11-14` — `catch { console.log("Element not found - handled gracefully"); }` is precisely the forbidden shape called out in the checklist: *"No catch block that only does console.log and silently continues."* Combined with the point above (the catch isn't even necessary — see the "Before adding a try/catch" section), this is the file's clearest violation.
- `tests/login.spec.ts:213` — the empty `.catch(() => {})` (discussed above) is a literal empty catch block, which the "before merging" checklist calls out as an absolute no.

---

## Beyond the checklist: other clean-code smells noticed

The checklist is entirely about error handling, so a few things it doesn't ask about are worth flagging separately:

1. **Intentionally-failing tests, inconsistently marked.** Two files correctly wrap a deliberately-broken assertion in `test.fail(...)` so the suite stays green while still proving the point: `tests/flaky-retry.spec.ts:27-32` and `tests/global-error-handler.spec.ts:16-23`. But two other files contain assertions that are *designed to fail* and are **not** wrapped in `test.fail(...)`:
   - `tests/hard-soft-assertions.spec.ts:4-10` (the "Hard Assertions" test — `expect(value).toBe(10)` on a `value` of `5`) and lines 12-25 (the "Soft Assertions" test — two of three soft assertions are deliberately wrong).
   - `tests/missing-element-handling.spec.ts:3-9` (`expect(element).not.toBeNull()` on an element that provably doesn't exist).
   
   Run as-is, these files report as genuine failures indistinguishable from a real regression — which cuts directly against the checklist's own opening reflection: *"A test suite's whole job is to tell the truth when something's broken."* An unmarked, permanently-red test is its own kind of lie (the inverse of a silent catch): it trains whoever's watching CI to expect red and start ignoring it.

2. **Duplicate/superseded spec files still present.** `tests/missing-element-handling.spec.ts` is fully superseded by `tests/missing-element-handling-enhanced.spec.ts` (same scenario, one fails by design, the other handles it — see finding #1). Similarly, `tests/shadow-dom-exercise.spec.ts` (two of its three cases fail because it has no `attachShadow` patch) is superseded by `tests/shadow-dom-working-code.spec.ts` (all three cases pass, with the patch applied in `beforeEach`). Keeping both the broken exploratory version and the fixed version around is a duplication smell — the broken one adds no coverage the fixed one doesn't already provide, just noise and two more permanently-red tests.

3. **Hard-coded `waitForTimeout` sleeps instead of assertion-based waits.** `tests/drag-and-drop.spec.ts:19` and `tests/frames-demo.spec.ts:24,40,56` all end with a bare `await page.waitForTimeout(2000)` "to observe changes in the browser." These are dead weight for the actual test outcome (the assertions above them already resolved) and are exactly the kind of arbitrary-magic-number wait Playwright's auto-waiting is supposed to make unnecessary.

4. **Repeated boilerplate across `tests/frames-demo.spec.ts`'s three tests.** Each of the three tests starts with the identical `logger.info("Navigating...")` + `page.goto(...)` pair. `tests/shadow-dom-working-code.spec.ts` shows the better pattern right next to it — the shared `page.goto` + init-script setup is factored into a single `test.beforeEach`. The frames file could do the same.

5. **Deprecated `page.$()` API used instead of locators.** `tests/screenshot.spec.ts:22` and `tests/missing-element-handling-enhanced.spec.ts:17` both call `page.$(...)`, which Playwright's own docs discourage in favor of `page.locator(...)` (locators auto-retry; `page.$` takes a single snapshot and can return stale/null results non-deterministically). Small, but worth fixing since the rest of the codebase (component objects, page objects) is otherwise consistently locator-based.

6. **Good counter-example worth naming:** `tests/login.spec.ts:3` hoists `LOGIN_URL` into a single constant used ~15 times across the file instead of repeating the literal string — this is the kind of DRY discipline the smells above are missing.

---

## Worst offenders — concrete before/after (not applied)

### 1. `tests/missing-element-handling-enhanced.spec.ts` — unnecessary catch that hides nothing

The try/catch adds a wasted 2-second wait and a console.log that provides no information the assertion below doesn't already provide.

**Before:**
```ts
try {
  // Try to find non-existent element with timeout
  await page.waitForSelector("#nonExistentElement", { timeout: 2000 });
} catch {
  // Handle gracefully when element is not found
  console.log("Element not found - handled gracefully");
}

// Verify element doesn't exist using $ which returns null
const element = await page.$("#nonExistentElement");
expect(element).toBeNull();
```

**After:**
```ts
// page.locator().count() never throws — it just reports how many matches
// exist, which is exactly what "verify this element is absent" needs.
// No try/catch required: there's no error to catch in the first place.
const count = await page.locator("#nonExistentElement").count();
expect(count).toBe(0);
```

### 2. `tests/login.spec.ts:211-214` — empty catch on the double-click race

The empty catch silently discards *any* error from the second click, not just the "button detached mid-navigation" case it's meant to tolerate — a real bug in the second click (e.g. a changed selector) would be swallowed identically to the expected race.

**Before:**
```ts
await Promise.all([
  page.locator('#submit').click(),
  page.locator('#submit').click().catch(() => {}),
]);
```

**After:**
```ts
await Promise.all([
  page.locator('#submit').click(),
  page.locator('#submit').click().catch((error) => {
    // Expected: the first click's navigation can detach the button before
    // the second click lands. Log it so an unrelated failure (e.g. a
    // selector that stopped matching) is still visible in CI output
    // instead of vanishing identically to the expected race.
    logger.info('Second submit click did not land (tolerated): %s', error);
  }),
]);
```

### 3. `tests/hard-soft-assertions.spec.ts` and `tests/missing-element-handling.spec.ts` — unmarked intentional failures

Both files contain assertions that are designed to fail, but neither uses `test.fail(...)` the way `flaky-retry.spec.ts` and `global-error-handler.spec.ts` correctly do — so a full suite run reports them as ordinary red failures with no signal that they're intentional.

**Before** (`tests/hard-soft-assertions.spec.ts`):
```ts
test("Hard Assertions - example", async ({}) => {
  const value = 5;
  expect(value).toBe(5); // passes
  expect(value).toBe(10); // will fail and stop this test
  expect(value).toBe(5);
});
```

**After:**
```ts
test.fail("Hard Assertions - example: a failing assertion stops the test immediately", async ({}) => {
  const value = 5;
  expect(value).toBe(5); // passes
  expect(value).toBe(10); // intentionally wrong - proves hard assertions halt execution
  expect(value).toBe(5); // never reached
});
```
(The same wrapping applies to the "Soft Assertions" test in the same file, and to the single assertion in `tests/missing-element-handling.spec.ts` — or, per finding #2 above, that file could simply be deleted now that `missing-element-handling-enhanced.spec.ts` covers the same ground without a permanent failure.)

---

## What I'd change now

> **Update:** the `login.spec.ts:213` empty-catch item below was fixed as part of this same capstone's test-simplification exercise ([02-test-simplification-login-spec.md](./02-test-simplification-login-spec.md)) — swapped the silent `.catch(() => {})` for `Promise.allSettled(...)`, which tolerates either click failing without a catch block to silently discard an unrelated error. Left the finding in place below since it's an accurate description of what this review found before that fix.

- Delete the unnecessary try/catch in `missing-element-handling-enhanced.spec.ts` and replace it with a non-throwing `locator().count()` check — no catch needed at all.
- Give the empty catch in `login.spec.ts:213` a one-line log so an unexpected failure there doesn't vanish indistinguishably from the expected race. *(Done — see update note above.)*
- Wrap the intentionally-failing assertions in `hard-soft-assertions.spec.ts` in `test.fail(...)`, matching the pattern already used correctly in `flaky-retry.spec.ts` and `global-error-handler.spec.ts` — and either fix or delete `missing-element-handling.spec.ts` and `shadow-dom-exercise.spec.ts` now that superseding, passing versions of both exist.
- Swap the two remaining `page.$()` calls (`screenshot.spec.ts`, `missing-element-handling-enhanced.spec.ts`) for locator-based equivalents.
- Replace the hard-coded `waitForTimeout(2000)` calls in `drag-and-drop.spec.ts` and `frames-demo.spec.ts` with either nothing (if the assertion above already proves the state) or a real wait condition; fold `frames-demo.spec.ts`'s three repeated `goto`+log pairs into a `beforeEach` the way `shadow-dom-working-code.spec.ts` already does.
- Leave the `try/finally` and `instanceof Error` checklist items as open — I don't have real code demonstrating either yet, and I'd rather note that honestly than force an artificial example in just to check a box.
- Everything else — the narrow, rethrow-with-context pattern in `registration.page.ts`, the documented deliberate swallow in `hooks.ts`, the scoped/capped retries in `flaky-retry.spec.ts`, and the total absence of try/catch across all step definitions — is already doing what the Day 2 checklist asked for, and I'd keep those exactly as they are.
