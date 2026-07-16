# Retries in Playwright — Test-Level and Step-Level

## What retries actually do
Retries are Playwright's built-in way to **automatically re-run a failed test** a set number of times before calling it truly "failed." They're meant for genuinely flaky tests — not as a substitute for fixing a broken test.

By default, retries are **off** (`0`). Turn them on with a CLI flag or the config file:

```bash
npx playwright test --retries=3
```

```ts
// playwright.config.ts
export default defineConfig({
  retries: 3,
});
```

## How Playwright classifies results
- **passed** — passed on the very first run
- **flaky** — failed once, then passed on a retry
- **failed** — failed on the first run *and* every retry

The "flaky" bucket is genuinely useful — it's Playwright telling you "this one isn't stable, go look at it," separate from tests that are just plain broken.

## What happens under the hood
Playwright runs tests inside isolated worker processes. If a test fails, Playwright **throws away that entire worker (and its browser)** and starts a fresh one for the next test — so one flaky test can't contaminate the ones after it. When retries are enabled, the *new* worker retries the failed test before moving on, rather than skipping straight past it.

## Detecting a retry inside a test
Sometimes you want different behavior on a retry — e.g., clearing server-side state that might be stuck from the failed attempt:

```ts
test('my test', async ({ page }, testInfo) => {
  if (testInfo.retry) {
    await cleanSomeCachesOnTheServer();
  }
  // ...
});
```

## Scoping retries to a specific group
You don't have to apply retries suite-wide — you can configure them per `describe` block:

```ts
test.describe(() => {
  test.describe.configure({ retries: 2 });

  test('test 1', async ({ page }) => { /* ... */ });
  test('test 2', async ({ page }) => { /* ... */ });
});
```

## Serial mode — retrying a dependent chain together
If tests in a group must run in order (`test.describe.configure({ mode: 'serial' })`), a failure skips everything after it in that run. With retries turned on, the **whole group** gets retried together from the start — not just the failed test.

> Playwright's own advice here: it's usually better to make tests independent so they can be retried individually and efficiently, rather than relying on serial mode.

## Step-level retries
Beyond whole-test retries, Playwright's assertion layer already retries at a finer grain — this is the auto-retrying behavior of `expect(...)` matchers like `toBeVisible()`, which keep re-checking the condition until it's true or the timeout hits. That's really a "step-level" retry mechanism baked into assertions themselves (covered in the soft-assertions notes), separate from whole-test retries.

## Practical takeaway
- Test retries = a safety net for the whole test, best combined with CI-only settings like `retries: process.env.CI ? 2 : 0`
- "Flaky" results are a signal to investigate, not ignore
- Keep tests independent so retries stay cheap and effective — serial + retries gets expensive fast
