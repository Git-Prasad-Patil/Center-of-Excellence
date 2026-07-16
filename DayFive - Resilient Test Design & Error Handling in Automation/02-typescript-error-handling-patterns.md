# Error Handling in Playwright (TypeScript) — Page Errors, Console Errors, Network Failures

Playwright tests don't just fail from bad assertions — a page can throw a JavaScript exception, log a console error, or a network call can silently 404, and your test can still "pass" if you're not watching for it. Handling these properly is how you catch bugs the assertions alone would miss.

## The three things worth listening for

### 1. `page.on('console', ...)` — console messages
Every time the browser logs something (via `console.log`, `console.error`, `console.warn`), Playwright fires a `console` event you can subscribe to.

```ts
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});
```

### 2. `page.on('pageerror', ...)` — uncaught exceptions
This fires when the page throws an **uncaught JavaScript exception** — a real bug in the app's frontend code, not something Playwright caused.

```ts
page.on('pageerror', (error) => {
  pageErrors.push({ name: error.name, message: error.message });
});
```

### 3. Network failures
You can also listen to `request`/`response` events to catch failed API calls (non-2xx statuses, timeouts), which is useful for figuring out *why* a page silently didn't render data.

```ts
page.on('response', (response) => {
  if (!response.ok()) {
    networkErrors.push(`${response.status()} ${response.url()}`);
  }
});
```

## Turning this into an assertion
The pattern people use most is: collect messages/errors into arrays during the test, then assert the arrays are empty at the end (or after each test, automatically).

```ts
test('page loads without console/page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();

  expect(errors).toHaveLength(0); // fails the test if anything leaked through
});
```

Note the important detail: you must attach the listener **before** the page does anything, or you'll miss early errors (e.g. errors thrown right after `page.goto`).

## Making it automatic with a fixture (recommended pattern)
Doing this manually in every test file gets repetitive fast. The cleaner approach is to override Playwright's built-in `page` fixture so every test automatically gets error checking for free:

```ts
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(`[console] ${msg.text()}`));
    page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

    await use(page); // test runs here

    expect(errors).toStrictEqual([]); // checked automatically after every test
  },
});
```

Every test file just imports this custom `test` instead of the default one, and gets error-checking for free — no boilerplate per test.

### Bonus: make it configurable
You can add a fixture option (e.g. `failOnJSError`) so specific tests can opt out when a page is *known* to log noisy warnings you don't care about, instead of failing every test that touches it.

## Why this matters for resilience
Without this, a test can technically "pass" (the button was clicked, the text appeared) while the app quietly threw an unrelated exception or failed an API call in the background — a real bug hiding behind a green checkmark. Capturing console/page/network errors turns those silent failures into loud, actionable ones.
