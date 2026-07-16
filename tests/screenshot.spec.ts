import { test } from "../utils/fixtures";

test("Screenshot", async ({ page, homePage }) => {
  // Navigation happens inside the `homePage` fixture (utils/fixtures.ts)
  // before this test body runs. Screenshotting itself isn't really a POM
  // concern (per the DayNine notes), so the capture calls below stay close
  // to their original form — `homePage` is only used here to confirm we're
  // on the expected page before capturing it.
  const welcomeText = await homePage.getWelcomeText();
  console.log(`Screenshotting homepage (welcome banner: "${welcomeText}")`);
  // Date.now() returns the number of milliseconds elapsed since January 1, 1970, 00:00:00 UTC.
  // This is commonly used to generate unique timestamps for filenames or other purposes where a unique identifier is needed based on the current time.
  const timestamp = Date.now();
  // Take a screenshot of the entire page
  await page.screenshot({
    path: `screenshots/full-page-${timestamp}.png`,
    // ${timestamp} ensures unique filenames, here $ is used to insert the timestamp variable into the filename and {} is used to denote that it's a variable.
    // This way, each screenshot will have a unique name based on the time it was taken.
    fullPage: true,
  });
  // Take a screenshot of a specific element
  const element = await page.$(".header-menu");
  if (element) {
    await element.screenshot({
      path: `screenshots/header-menu-${timestamp}.png`,
    });
  }
  // Take a screenshot of the viewport
  await page.screenshot({ path: `screenshots/viewport-${timestamp}.png` });
  // Take a screenshot of a specific area
  await page.screenshot({
    path: `screenshots/specific-area-${timestamp}.png`,
    clip: { x: 0, y: 0, width: 800, height: 600 },
  });
});
