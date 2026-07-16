# Test Isolation — Why Each Test Should Set Up and Tear Down Its Own State

## The principle
Every test should run **completely independently** — its own storage, session storage, cookies, and data — with zero reliance on another test having run first (or in a particular order). Playwright's docs call this out as core testing philosophy, not an optional nicety.

Why it matters:
- **Reproducibility** — a failing test should fail the same way whether it runs alone or as part of the full suite.
- **Easier debugging** — when a test's failure only depends on itself, you don't have to reconstruct what three earlier tests left behind.
- **Prevents cascading failures** — one broken test can't take down every test after it.

This connects directly to the Spotify flakiness research: "reliance on test order/global state" was one of their top three causes of flaky tests. If a test only passes when the *whole suite* runs (never alone), that's the tell-tale sign of a hidden dependency.

## How to isolate without repeating yourself
Use `beforeEach` to run shared setup (like logging in) before every test, so no test relies on another for its starting state:

```ts
import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('username');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test('first', async ({ page }) => {
  // page is already signed in — independent of any other test
});

test('second', async ({ page }) => {
  // also signed in, freshly, regardless of test order
});
```

A faster variant: reuse a **signed-in storage state** (via a setup project) so you log in once and skip repeating the full login flow in every test.

## A little duplication is fine
Playwright's own guidance: it's okay to have some repeated setup code across tests if it keeps things simple and readable — the goal is *independence*, not eliminating every line of duplication at all costs.

## Refactoring exercise: turning dependent tests into isolated ones

**Before (brittle — tests depend on each other):**
```ts
let cartId: string;

test('user adds item to cart', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  cartId = await page.getByTestId('cart-id').innerText(); // saved for later test
});

test('user checks out', async ({ page }) => {
  await page.goto(`/cart/${cartId}`); // fails if run alone, or out of order
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order placed')).toBeVisible();
});
```
Problems: `cartId` is shared state; running `checkout` alone breaks; running tests in parallel/out of order breaks; a failure in test 1 causes test 2 to fail with a confusing, unrelated error.

**After (isolated — each test builds its own state):**
```ts
async function addItemToCart(page): Promise<string> {
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  return page.getByTestId('cart-id').innerText();
}

test('user adds item to cart', async ({ page }) => {
  const cartId = await addItemToCart(page);
  await expect(page.getByTestId('cart-id')).toHaveText(cartId);
});

test('user checks out', async ({ page }) => {
  const cartId = await addItemToCart(page); // builds its own state, doesn't borrow test 1's
  await page.goto(`/cart/${cartId}`);
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order placed')).toBeVisible();
});
```
Now each test can run alone, in parallel, or in any order, and a failure in one never causes a confusing failure in another.

## Success checklist for this exercise
- [ ] No test reads a variable set by another test
- [ ] Each test can run in isolation (`npx playwright test -g "user checks out"`) and still pass
- [ ] Shared setup steps extracted into helper functions or `beforeEach`, not global variables
- [ ] Suite still passes when run with `fullyParallel: true`
