import { test, expect, Page } from '@playwright/test';

const LOGIN_URL = 'https://practicetestautomation.com/practice-test-login/';
const SUCCESS_URL_PATTERN = /logged-in-successfully/;
const VALID_USERNAME = 'student';
const VALID_PASSWORD = 'Password123';
const WELCOME_MESSAGE = 'Congratulations student. You successfully logged in!';

async function attemptLogin(page: Page, username: string, password: string) {
  await page.goto(LOGIN_URL);
  if (username) await page.locator('#username').fill(username);
  if (password) await page.locator('#password').fill(password);
  await page.locator('#submit').click();
}

async function expectLoginSuccess(page: Page) {
  await expect(page).toHaveURL(SUCCESS_URL_PATTERN);
  await expect(page.getByText(WELCOME_MESSAGE)).toBeVisible();
}

async function expectLoginError(page: Page, message: string) {
  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveText(message);
  await expect(page).toHaveURL(LOGIN_URL);
}

test.describe('Zero — no credentials entered', () => {
  test('does not navigate to the success page when username and password are left blank', async ({ page }) => {
    // Note: this site does not use HTML5 `required` attributes on #username/#password, so
    // submitting blank fields does not trigger native browser validation. The page's own
    // script still runs and treats a blank username as invalid, but the assertion that
    // matters here is that submission never reaches the success page.
    await attemptLogin(page, '', '');

    await expect(page).toHaveURL(LOGIN_URL);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});

test.describe('One — single valid or invalid credential', () => {
  test('logs in successfully and lands on the success page with valid credentials', async ({ page }) => {
    await attemptLogin(page, VALID_USERNAME, VALID_PASSWORD);

    await expectLoginSuccess(page);
    await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
  });

  test('shows an invalid-username error and stays on the login page for a wrong username', async ({ page }) => {
    await attemptLogin(page, 'incorrectUser', VALID_PASSWORD);
    await expectLoginError(page, 'Your username is invalid!');
  });

  test('shows an invalid-password error and stays on the login page for a wrong password', async ({ page }) => {
    await attemptLogin(page, VALID_USERNAME, 'wrongPassword');
    await expectLoginError(page, 'Your password is invalid!');
  });

  test('shows an invalid-password error when username is valid but password is left blank', async ({ page }) => {
    // The site's validation checks username correctness before password: a valid
    // username paired with a blank password falls through to the password check,
    // so the password-invalid error is expected here rather than a username error.
    await attemptLogin(page, VALID_USERNAME, '');
    await expectLoginError(page, 'Your password is invalid!');
  });

  test('shows an invalid-username error when password is valid but username is left blank', async ({ page }) => {
    // Username is validated first, so a blank username surfaces the username-invalid
    // error even though the password field holds the correct value.
    await attemptLogin(page, '', VALID_PASSWORD);
    await expectLoginError(page, 'Your username is invalid!');
  });
});

test.describe('Many — repeated submissions', () => {
  test('succeeds on a second attempt with correct credentials after an initial invalid submission', async ({ page }) => {
    await attemptLogin(page, VALID_USERNAME, 'wrongPassword');
    await expect(page.locator('#error')).toBeVisible();

    await page.locator('#username').fill(VALID_USERNAME);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submit').click();

    await expectLoginSuccess(page);
  });
});

test.describe('Boundary — edge-case input values', () => {
  test('treats the username as case-sensitive and rejects a capitalized variant', async ({ page }) => {
    await attemptLogin(page, 'Student', VALID_PASSWORD);
    await expectLoginError(page, 'Your username is invalid!');
  });

  test('treats the password as case-sensitive and rejects a lowercase variant', async ({ page }) => {
    await attemptLogin(page, VALID_USERNAME, 'password123');
    await expectLoginError(page, 'Your password is invalid!');
  });

  test('does not trim surrounding whitespace and rejects a padded username', async ({ page }) => {
    await attemptLogin(page, ' student ', VALID_PASSWORD);
    await expectLoginError(page, 'Your username is invalid!');
  });

  test('handles an extremely long username without crashing and still reports it as invalid', async ({ page }) => {
    const longUsername = 'a'.repeat(1000);
    await attemptLogin(page, longUsername, VALID_PASSWORD);
    await expectLoginError(page, 'Your username is invalid!');
  });
});

test.describe('Exceptions — abuse and race scenarios', () => {
  test('handles a SQL-injection-like username safely and reports it as invalid', async ({ page }) => {
    await attemptLogin(page, "' OR '1'='1", VALID_PASSWORD);
    await expectLoginError(page, 'Your username is invalid!');
  });

  test('ends up on the success page after multiple rapid submit clicks', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.locator('#username').fill(VALID_USERNAME);
    await page.locator('#password').fill(VALID_PASSWORD);

    // Firing both clicks concurrently and tolerating either one failing covers the case
    // where the first click's navigation detaches the button before the second lands;
    // what matters is the final resting page, not either individual click's outcome.
    // allSettled (rather than a try/catch around a plain click) makes that tolerance
    // explicit instead of silently swallowing a rejection.
    await Promise.allSettled([
      page.locator('#submit').click(),
      page.locator('#submit').click(),
    ]);

    await expectLoginSuccess(page);
  });
});

test.describe('Interface — alternate entry and navigation paths', () => {
  test('does not submit via the Enter key and shows an invalid-username error instead', async ({ page }) => {
    // This site has no <form> element wrapping the inputs (verified via DOM inspection),
    // so the Submit button's click handler is never invoked by a native Enter-triggered
    // form submission. Pressing Enter in either field consistently surfaces the
    // username-invalid error and keeps the user on the login page, even with correct
    // credentials in both fields.
    await page.goto(LOGIN_URL);
    await page.locator('#username').fill(VALID_USERNAME);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#password').press('Enter');

    await expectLoginError(page, 'Your username is invalid!');
  });

  test('reaches the success page via direct navigation without logging in', async ({ page }) => {
    // This site is static and has no server-side session/auth gating on the
    // success page, so navigating directly still renders the congratulations
    // content and "Log out" link rather than redirecting back to the login form.
    await page.goto('https://practicetestautomation.com/logged-in-successfully/');

    await expectLoginSuccess(page);
    await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
  });

  test('shows the login form again after navigating back from the success page', async ({ page }) => {
    await attemptLogin(page, VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(SUCCESS_URL_PATTERN);

    await page.goBack();

    await expect(page.locator('#username')).toBeVisible();
  });
});
