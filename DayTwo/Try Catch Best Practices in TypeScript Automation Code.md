# 

## The core problem

In test automation, `try/catch` is a double-edged sword. Used well, it gives you clear, actionable failures. Used badly, it **swallows real bugs** and turns a red flag into a silent pass — which is worse than no error handling at all, because now you _trust_ a suite that's lying to you. In test automation, how errors are handled determines whether failures are visible and actionable, or quietly ignored.

So the whole game is: **know which of the three buckets a failure belongs to.**

---

## 🟢 1. When to CATCH (and handle quietly)

Catch only when the failure is **expected, non-fatal to the test's goal, and you have a real recovery action** — not just "make the red go away."

Good reasons to catch:

- **Optional UI elements** — e.g. a cookie banner that may or may not appear. Catching lets you move on without failing the test over something irrelevant to what you're actually verifying.
- **Cleanup / teardown** — closing a browser, deleting test data, releasing a resource. You don't want a cleanup failure to mask the _real_ assertion failure that happened earlier.
- **Intentional negative testing** — you _expect_ an error and are asserting that it happens (e.g. checking that an invalid URL throws). Here the catch is the actual point of the test.
- **Retry logic** — catching a transient failure (flaky network blip) to try again a bounded number of times, then giving up loudly if it keeps failing.

Rule: if you catch, you must **do something meaningful** in the catch block — log it, take a screenshot, retry, or explicitly decide "this is fine, continue." Catching just to `console.log` and move on with no plan is a smell.

---

## 🔁 2. When to RETHROW

This is the most common _correct_ move in test code. You catch **only to add context**, then immediately rethrow so the test still fails, loudly, with a better message.

If a step fails, re-throw the error so the test fails immediately and clearly.

Rethrow when:

- You want to attach **context** the raw error doesn't have — which step, which locator, which page URL, what data was being used.
- You want to **attach diagnostics** — take a screenshot, dump the page HTML, log network state — before letting the failure propagate.
- The failure is **not yours to silently decide about**. As a rule of thumb: if you're not 100% sure the failure is safe to ignore, rethrow.

```ts
try {
  await submitButton.click();
} catch (err) {
  throw new Error(`Submit button was not clickable: ${(err as Error).message}`);
}
```

---

## 🔴 3. When to LET IT FAIL (no try/catch at all)

Most Playwright assertions and actions should have **no try/catch around them whatsoever.** Playwright already:

- auto-waits for elements,
- produces a readable timeout error naming the locator that failed,
- attaches a trace/screenshot/video on failure (if configured),
- fails the test with a clear stack trace pointing at the exact line.

Wrapping every `click()` or `expect()` in try/catch just to "handle" it usually **destroys all of that built-in clarity** and replaces it with a vague custom message that hides _where_ things went wrong.

**Default assumption: let it fail.** Only add a try/catch when you have a specific, deliberate reason from bucket 1 or 2 above.

---

## 🚫 Anti-patterns to avoid

|Anti-pattern|Why it's bad|
|---|---|
|Empty catch block `catch {}`|Silently swallows real bugs — test goes green while the app is broken|
|`catch (e) { console.log(e) }` and continue|Same as above, just with extra noise in logs nobody reads|
|Wrapping the entire test body in one big try/catch|You lose the ability to know _which_ step failed|
|Using try/catch to avoid fixing a flaky locator|Papers over a root cause instead of fixing it|
|Retrying forever with no cap|Turns a real bug into a slow, expensive false pass or a hang|
|Catching in a `finally`-shaped cleanup and not rethrowing the original error|You lose the actual reason the test failed|

---

## ✅ General principles

1. **Fail loud, fail fast, fail with context.** A test suite you can't trust is worse than no test suite.
2. **Catch narrowly.** Wrap the _one action_ you expect might fail, not a whole block of unrelated steps.
3. **Always check error type before assuming shape.** In TS, `catch (error)` is typed `unknown` by default (4.4+) — narrow with `instanceof Error` before reading `.message`.
4. **Use try/finally for cleanup**, not try/catch — you want cleanup to always run, but you don't want to accidentally suppress the original failure. Use try/finally to guarantee resources like browsers are closed even when the automation code throws.
5. **Prefer Playwright's built-ins over manual polling** — `expect(locator).toBeVisible({ timeout })`, web-first assertions, and auto-retrying assertions already do most of what a hand-rolled try/catch retry loop would do, more safely.
6. **Reserve custom retry loops for genuinely flaky infra**, not to mask app bugs, and always cap the retry count. Excessive use of retries can hide real issues like timeouts and race conditions, so root causes should still be resolved rather than papered over.
7. **Add diagnostics on the way out, not instead of the way out** — screenshot/log then rethrow, never screenshot/log _instead of_ rethrowing.