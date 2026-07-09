import { test, expect } from "@playwright/test";

test("Drag and drop", async ({ page }) => {
  await page.goto("https://seleniumbase.io/other/drag_and_drop");

  const emp = page.locator("#div1");
  const img = page.locator("#drag1");

  //Appraoch 1:  mouse hover and drag manually

  await img.hover();
  await page.mouse.down();
  await emp.hover();
  await page.mouse.up();

  //Appraoch 2: using dragAndDrop method
  // await img.dragTo(emp);

  await page.waitForTimeout(2000);
});

// npx playwright test tests/dragAndDrop.spec.ts --headed
