# Soft Assertions in Playwright — When to Use Them vs Hard Assertions

## Hard assertions (the default)
Every normal `expect(...)` call in Playwright is a **hard assertion**: the instant it fails, the test stops immediately. Anything after that line never runs.

```ts
await expect(page.getByTestId('status')).toHaveText('Success'); // if this fails, test stops here
await expect(page.getByTestId('eta')).toHaveText('1 day');      // never runs
```

This is the right behavior when a failure means "there's no point continuing" — e.g. if login fails, checking the dashboard afterward is meaningless.

## Soft assertions
Add `.soft` and a failure gets **recorded but doesn't stop the test** — execution keeps going, and at the end Playwright marks the test as failed and reports *every* soft failure that happened, not just the first one.

```ts
await expect.soft(page.getByTestId('status')).toHaveText('Success');
await expect.soft(page.getByTestId('eta')).toHaveText('1 day');
// ...test keeps running even if the line above failed
await page.getByRole('link', { name: 'next page' }).click();
await expect.soft(page.getByRole('heading', { name: 'Make another order' })).toBeVisible();
```

Note: soft assertions only work inside the Playwright test runner (not standalone `expect` usage).

## When soft assertions genuinely help
- **Verifying many independent fields at once** — e.g. every field on a form is pre-filled correctly, every column header in a table is correct, every widget on a dashboard loaded. You want the *whole* picture of what's broken in one run, not a fix-one/rerun/fix-next loop.
- **A translation or permissions matrix** — one missing string or permission shouldn't hide the rest of the report.

## When to stick with hard assertions
- Preconditions that the rest of the test depends on (login succeeded, page navigated correctly)
- Anywhere a failure means continuing would be pointless or misleading
- Playwright's own advice: don't mix soft and hard carelessly in the same flow — it adds complexity without much benefit. Pick one intent per section of the test.

## Bailing out early from soft assertions on purpose
If enough soft assertions have already failed and continuing further is a waste of time (e.g. don't bother submitting a form you already know is invalid), check `test.info().errors`:

```ts
await expect.soft(page.getByTestId('status')).toHaveText('Success');
await expect.soft(page.getByTestId('eta')).toHaveText('1 day');

// Manually stop here if there were any failures so far
expect(test.info().errors).toHaveLength(0);
```
This effectively converts "soft so far" into a hard stop at a chosen checkpoint.

## Custom messages (works for both types)
Adding a message as the second argument makes failures much easier to read in reports:
```ts
await expect(page.getByText('Name'), 'should be logged in').toBeVisible();
await expect.soft(value, 'my soft assertion').toBe(56);
```

## A reusable "always soft" expect
Instead of typing `.soft` everywhere, configure a dedicated instance:
```ts
const softExpect = expect.configure({ soft: true });
// use softExpect(...) anywhere you'd normally write expect.soft(...)
```

## Quick decision rule
| Situation | Use |
|---|---|
| Failure means the rest of the test is meaningless | Hard assertion |
| You want a full list of everything wrong in one run | Soft assertion |
| You want to bail early once "too many" soft failures pile up | Soft + `test.info().errors` check |
