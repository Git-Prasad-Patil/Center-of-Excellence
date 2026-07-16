# Exercise Notes: Global Error Handler in Playwright Config

**Goal:** instead of adding console/page-error listeners in every single test file, wire it up once, globally, so it applies to the whole suite automatically.

## The cleanest way: a shared fixture file
Playwright doesn't have a literal "global error handler" config field, but the idiomatic way to get the same effect is a **custom fixture** that wraps the built-in `page` fixture, placed in one shared file and imported everywhere.

`fixtures.ts`
```ts
import { test as base, expect } from '@playwright/test';

type ErrorLog = { type: 'console' | 'pageerror' | 'crash'; message: string };

export const test = base.extend<{ page: import('@playwright/test').Page }>({
  page: async ({ page }, use) => {
    const errors: ErrorLog[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push({ type: 'console', message: msg.text() });
      }
    });

    page.on('pageerror', (error) => {
      errors.push({ type: 'pageerror', message: error.message });
    });

    page.on('crash', () => {
      errors.push({ type: 'crash', message: 'Page crashed' });
    });

    await use(page); // hand control back to the test

    // runs after every test automatically
    if (errors.length > 0) {
      console.warn('Captured page errors:', errors);
    }
    expect(errors, 'Page should not log console/page errors').toHaveLength(0);
  },
});

export { expect };
```

Every spec file then does:
```ts
import { test, expect } from './fixtures';

test('homepage loads cleanly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```
No extra code needed per test — the check runs automatically because it's baked into the `page` fixture itself.

## Handling page crashes specifically
`page.on('crash', ...)` catches full browser tab crashes (rare, but they happen with memory-heavy pages). It's worth capturing separately from JS errors since a crash usually means the rest of the test can't continue meaningfully.

## Optional: attach evidence instead of just failing
Rather than only failing the test, you can attach the captured errors as a report artifact so they show up in the HTML report:
```ts
await use(page);
if (errors.length > 0) {
  await use(page); // (already used above — just showing the attach pattern)
}
```
In practice, attach inside an `afterEach`-style hook using `testInfo.attach(...)` so failed runs come with a readable error log, not just a stack trace.

## How to test the exercise itself
1. Point the fixture at a page with a deliberate `console.error(...)` or an uncaught `throw` in its JS.
2. Run the suite and confirm the test **fails** with your custom message, and the captured messages show up in the output.
3. Fix the page (or mock it away) and confirm the test goes back to green — proving the handler only fires on real errors, not false positives.

## Success criteria checklist
- [ ] Global listener wired through a shared fixture, not repeated per test
- [ ] Captures `console` (filtered to `error` type), `pageerror`, and `crash`
- [ ] Fails the test with a clear message when errors are found
- [ ] Verified against a page intentionally throwing an error
