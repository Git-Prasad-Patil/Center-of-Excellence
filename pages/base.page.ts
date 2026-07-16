import { Locator, Page } from "@playwright/test";
import logger from "../utils/logger";

// BasePage is the Template Method skeleton every Playwright page object in
// this suite extends: it fixes *how* pages wait, log, navigate, and capture
// diagnostic context on failure, while leaving *what* each page contains
// (locators, domain methods) entirely to the concrete subclasses.
//
// Nothing page-specific belongs here — see
// "DayNine - Page Object Model Depth & Framework Architecture/04-base-page-class-patterns-in-typescript.md"
// for the reasoning. Note this class's error capture is deliberately NOT a
// pass/fail mechanism: utils/fixtures.ts already fails the test if the page
// logs unexpected console/pageerror/crash events. captureErrorContext here
// only grabs a screenshot + log line when an explicit page-object action
// throws, to make debugging that failure easier; it never swallows or
// re-throws the error itself, that decision stays with the caller.
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Waits for a locator to become visible. A thin, consistent wrapper around
   * Playwright's own waiting API so every page object waits the same way.
   */
  protected async waitForVisible(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  /**
   * Navigates to a fully-qualified URL and logs the action. Kept generic
   * (no base-URL assumptions baked in) since callers pass a full URL, e.g.
   * `https://demowebshop.tricentis.com/`.
   */
  protected async goto(url: string): Promise<void> {
    this.log(`Navigating to ${url}`);
    await this.page.goto(url);
  }

  /**
   * Logs a page-object action through the shared winston logger, prefixed
   * with the concrete class name so log lines are traceable to their source.
   */
  protected log(action: string): void {
    logger.info(`[${this.constructor.name}] ${action}`);
  }

  /**
   * Captures diagnostic context (screenshot + error log) when an explicit
   * action inside a page object throws. Does NOT swallow or rethrow the
   * error — callers wrap their own action in try/catch and invoke this from
   * the catch block before deciding whether to rethrow.
   */
  protected async captureErrorContext(error: unknown, label: string): Promise<void> {
    const timestamp = Date.now();
    const safeLabel = label.replace(/[^a-zA-Z0-9-_]/g, "-");
    const screenshotPath = `screenshots/${safeLabel}-${timestamp}.png`;

    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (screenshotError) {
      logger.error(
        `[${this.constructor.name}] Failed to capture screenshot for "${label}": ${screenshotError}`
      );
    }

    logger.error(`[${this.constructor.name}] Error during "${label}": ${error}`);
  }
}
