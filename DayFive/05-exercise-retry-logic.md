# Exercise Notes: Configuring Retry Logic Against an Unreliable Test

**Goal:** set up retries and prove they work by testing them against a scenario built to be unreliable on purpose.

## Step 1 — Build an intentionally flaky scenario
The simplest way is a counter that fails the first attempt(s) and passes later, simulating something like a slow-loading widget or a backend that's occasionally slow to respond:

```ts
// flaky.spec.ts
import { test, expect } from '@playwright/test';

let attempt = 0;

test('intentionally unreliable test', async ({ page }, testInfo) => {
  attempt++;
  await page.goto('https://example.com');

  // Fails on the first attempt only, to simulate flakiness
  if (attempt === 1 && testInfo.retry === 0) {
    expect(attempt, 'Simulated flake — forcing a retry').toBe(2);
  }

  await expect(page).toHaveTitle(/Example/);
});
```

## Step 2 — Configure retries
Global, in `playwright.config.ts`:
```ts
export default defineConfig({
  retries: process.env.CI ? 2 : 1, // fewer retries locally, more on CI
});
```

Or scoped to just this test file/group while experimenting:
```ts
test.describe(() => {
  test.describe.configure({ retries: 2 });
  // ...tests here
});
```

## Step 3 — Run it and read the report
```bash
npx playwright test flaky.spec.ts
```
Expected output pattern:
```
✘ intentionally unreliable test (attempt 1 — fails)
✓ intentionally unreliable test (attempt 2 — passes)
1 flaky
  flaky.spec.ts:6:1 › intentionally unreliable test
1 passed (with retries)
```
The key thing to confirm: Playwright reports it as **flaky**, not failed — meaning your retry config correctly gave it a second chance and it recovered.

## Step 4 — Verify the "give up" case too
Temporarily set the test to always fail (e.g. `expect(1).toBe(2)`), keep retries at 1–2, and confirm the suite reports it as **failed** after exhausting all attempts — proving retries don't mask a genuinely broken test forever.

## What to document from this exercise
- The retries value you chose and why (e.g. 2 on CI, 0 locally — so local dev sees real failures immediately)
- Confirmation the "flaky" classification appeared in the report
- Confirmation a truly broken test still fails after all retries are used
- A note that retries are a mitigation for flakiness, not a fix — the underlying flaky scenario should still get investigated separately
