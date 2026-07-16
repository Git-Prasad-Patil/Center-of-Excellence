import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - letcode.in', () => {
  // Playwright's locators pierce OPEN shadow roots automatically, but per the
  // official docs, closed-mode shadow roots are NOT supported out of the box.
  // Workaround: patch Element.prototype.attachShadow before the page's own
  // scripts run, so any shadow root the page creates — even ones it asks to
  // be "closed" — actually gets created as "open" and becomes reachable.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const originalAttachShadow = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function (options) {
        return originalAttachShadow.call(this, { ...options, mode: 'open' });
      };
    });

    await page.goto('https://letcode.in/shadow/');
  });

  test('access elements in open shadow DOM', async ({ page }) => {
    const firstName = page.locator('#fname');
    await firstName.fill('Prasad');
    await expect(firstName).toHaveValue('Prasad');
  });

  test('access elements in closed shadow DOM inside a custom element', async ({ page }) => {
    // #lname lives inside <my-web-component>'s closed shadow root
    const lastName = page.locator('#lname');
    await lastName.fill('Patil');
    await expect(lastName).toHaveValue('Patil');
  });

  test('access elements in closed shadow DOM attached directly to a div', async ({ page }) => {
    // #email lives inside the closed shadow root on <div id="close-shadow">
    const email = page.locator('#email');
    await email.fill('prasad@yahoo.com');
    await expect(email).toHaveValue('prasad@yahoo.com');
  });
});