import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://practicetestautomation.com/practice-test-login/';

test('logs in successfully and lands on the success page with valid credentials', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page).toHaveURL(/logged-in-successfully/);
  await expect(page.getByText('Congratulations student. You successfully logged in!')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
});

test('shows an invalid-username error and stays on the login page for a wrong username', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('incorrectUser');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('shows an invalid-password error and stays on the login page for a wrong password', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('wrongPassword');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your password is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('does not navigate to the success page when username and password are left blank', async ({ page }) => {
  await page.goto(LOGIN_URL);

  // Note: this site does not use HTML5 `required` attributes on #username/#password, so
  // submitting blank fields does not trigger native browser validation. The page's own
  // script still runs and treats a blank username as invalid, but the assertion that
  // matters here is that submission never reaches the success page.
  await page.locator('#submit').click();

  await expect(page).toHaveURL(LOGIN_URL);
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

test('shows an invalid-password error when username is valid but password is left blank', async ({ page }) => {
  await page.goto(LOGIN_URL);

  // The site's validation checks username correctness before password: a valid
  // username paired with a blank password falls through to the password check,
  // so the password-invalid error is expected here rather than a username error.
  await page.locator('#username').fill('student');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your password is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('shows an invalid-username error when password is valid but username is left blank', async ({ page }) => {
  await page.goto(LOGIN_URL);

  // Username is validated first, so a blank username surfaces the username-invalid
  // error even though the password field holds the correct value.
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('treats the username as case-sensitive and rejects a capitalized variant', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('Student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('treats the password as case-sensitive and rejects a lowercase variant', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your password is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('does not trim surrounding whitespace and rejects a padded username', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill(' student ');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('succeeds on a second attempt with correct credentials after an initial invalid submission', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('wrongPassword');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page).toHaveURL(/logged-in-successfully/);
  await expect(page.getByText('Congratulations student. You successfully logged in!')).toBeVisible();
});

test('reaches the success page via direct navigation without logging in', async ({ page }) => {
  // This site is static and has no server-side session/auth gating on the
  // success page, so navigating directly still renders the congratulations
  // content and "Log out" link rather than redirecting back to the login form.
  await page.goto('https://practicetestautomation.com/logged-in-successfully/');

  await expect(page).toHaveURL(/logged-in-successfully/);
  await expect(page.getByText('Congratulations student. You successfully logged in!')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
});

test('shows the login form again after navigating back from the success page', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page).toHaveURL(/logged-in-successfully/);

  await page.goBack();

  await expect(page.locator('#username')).toBeVisible();
});

test('handles an extremely long username without crashing and still reports it as invalid', async ({ page }) => {
  await page.goto(LOGIN_URL);

  const longUsername = 'a'.repeat(1000);
  await page.locator('#username').fill(longUsername);
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('handles a SQL-injection-like username safely and reports it as invalid', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill("' OR '1'='1");
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('does not submit via the Enter key and shows an invalid-username error instead', async ({ page }) => {
  // This site has no <form> element wrapping the inputs (verified via DOM inspection),
  // so the Submit button's click handler is never invoked by a native Enter-triggered
  // form submission. Pressing Enter in either field consistently surfaces the
  // username-invalid error and keeps the user on the login page, even with correct
  // credentials in both fields.
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#password').press('Enter');

  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText('Your username is invalid!');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('ends up on the success page after multiple rapid submit clicks', async ({ page }) => {
  await page.goto(LOGIN_URL);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');

  // Firing both clicks concurrently and tolerating a failure on the second click
  // covers the case where the first click's navigation detaches the button before
  // the second click lands; what matters is the final resting page, not either click.
  await Promise.all([
    page.locator('#submit').click(),
    page.locator('#submit').click().catch(() => {}),
  ]);

  await expect(page).toHaveURL(/logged-in-successfully/);
  await expect(page.getByText('Congratulations student. You successfully logged in!')).toBeVisible();
});
