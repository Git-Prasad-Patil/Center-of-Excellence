import { test, expect } from '@playwright/test';

test('access elements in open shadow DOM', async ({ page }) => {
  await page.goto('https://letcode.in/shadow/');
  const firstNameInput = page.locator('#open-shadow');
  await firstNameInput.locator('#fname').fill('Prasad');
  await expect(firstNameInput.locator('#fname')).toHaveValue("Prasad");
});

test('access elements in closed shadow DOM', async ({ page }) => {
  await page.goto('https://letcode.in/shadow/');
  const lastNameInput = page.locator('.field');
  await lastNameInput.locator('[id="lname"]').fill("Patil");
  await expect(lastNameInput.locator('[id="lname"]')).toHaveValue("Patil");
});

test('closed shadow DOM', async ({ page }) => {
  await page.goto('https://letcode.in/shadow/');
  const lastNameInput = page.locator('#close-shadow');
  await lastNameInput.locator('#email').fill("prasad@yahoo.com");
  await expect(lastNameInput.locator('[id="email"]')).toHaveValue("prasad@yahoo.com");
});