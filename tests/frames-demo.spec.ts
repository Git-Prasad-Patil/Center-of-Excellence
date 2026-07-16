import { test, expect } from "@playwright/test";
import logger from "../utils/logger";

test("Frame Demo", async ({ page }) => {
  logger.info("Navigating to the UI.Vision frame demo page");
  await page.goto("https://ui.vision/demo/webtest/frames/");
  const frames = page.frames();
  logger.info("Total number of frames on the page: %d", frames.length);

  const frame1 = page.frame({
    url: "https://ui.vision/demo/webtest/frames/frame_1",
  });
  if (!frame1) {
    logger.error("Frame 1 not found");
    throw new Error("Frame 1 not found");
  }

  if (frame1) {
    await frame1.fill('[name="mytext1"]', "Hello from Frame 1");
    const insertedText = await frame1.inputValue('[name="mytext1"]');
    logger.info("Verified inserted text in Frame 1: %s", insertedText);
    expect(insertedText).toBe("Hello from Frame 1");
  }
  await page.waitForTimeout(2000); // Wait for 2 seconds to observe the changes in the browser
});

test("Using Frame Locator", async ({ page }) => {
  logger.info("Navigating to the UI.Vision frame demo page");
  await page.goto("https://ui.vision/demo/webtest/frames/");
  const frameLocator = page
    .frameLocator('[src="frame_2.html"]')
    .locator('[name="mytext2"]');

  if (frameLocator) {
    await frameLocator.fill("Hello from Frame 2");
    const insertedText = await frameLocator.inputValue();
    logger.info("Verified inserted text in Frame 2: %s", insertedText);
    expect(insertedText).toBe("Hello from Frame 2");
  }
  await page.waitForTimeout(2000); // Wait for 2 seconds to observe the changes in the browser
});

test("innerFrame Demo", async ({ page }) => {
  logger.info("Navigating to the UI.Vision frame demo page");
  await page.goto("https://ui.vision/demo/webtest/frames/");
  const innerFrame = page.frame({
    url: "https://ui.vision/demo/webtest/frames/frame_3",
  });
  if (innerFrame) {
    await innerFrame.fill('[name="mytext3"]', "I am inside Inner Frame");
    const insertedText = await innerFrame.inputValue('[name="mytext3"]');
    logger.info("Verified inserted text in Inner Frame: %s", insertedText);
    expect(insertedText).toBe("I am inside Inner Frame");
  }

  await page.waitForTimeout(2000); // Wait for 2 seconds to observe the changes in the browser
});

// npx playwright test tests/framesDemo.spec.ts --headed
